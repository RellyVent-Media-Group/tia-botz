#!/usr/bin/env python3
"""
WhatsApp Forensics Module
Analyzes WhatsApp artifacts from ChatStorage.sqlite, iMessage chat.db,
media directories, and optional backups.
"""

import sqlite3
import json
import re
import argparse
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import pandas as pd

DEFAULT_EXTRACT_DIR = Path.home() / "Desktop" / "Forensic_Extract"
DEFAULT_REPORT_DIR = Path.home() / "Desktop" / "Forensic_Reports"
DEFAULT_CHAT_DB = Path.home() / "Library" / "Messages" / "chat.db"
DEFAULT_WHATSAPP_DB = (
    Path.home()
    / "Library"
    / "Group Containers"
    / "group.net.whatsapp.WhatsApp.shared"
    / "ChatStorage.sqlite"
)


class WhatsAppForensics:
    """WhatsApp forensic analysis module"""

    def __init__(self, base_path: str = None, output_path: str = None,
                 chat_db: str = None, whatsapp_db: str = None):
        self.base_path = Path(base_path) if base_path else DEFAULT_EXTRACT_DIR
        self.output_path = Path(output_path) if output_path else DEFAULT_REPORT_DIR
        self.output_path.mkdir(parents=True, exist_ok=True)
        self.chat_db = Path(chat_db) if chat_db else DEFAULT_CHAT_DB
        self.whatsapp_db = (
            Path(whatsapp_db) if whatsapp_db else self._find_whatsapp_db()
        )

        # WhatsApp-related patterns
        self.whatsapp_patterns = {
            'domains': [
                r'whatsapp\.com',
                r'wa\.me',
                r'web\.whatsapp\.com',
                r'whatsapp\.net',
                r'whatsapp\.org',
                r'api\.whatsapp\.com'
            ],
            'file_paths': [
                r'WhatsApp',
                r'whatsapp',
                r'AppDomainGroup-group\.net\.whatsapp\.WhatsApp\.shared',
                r'Media/WhatsApp',
                r'Library/SMS/WhatsApp',
                r'containers/WhatsApp'
            ],
            'message_patterns': [
                r'whatsapp',
                r'wa\.me',
                r'WhatsApp',
                r'\+[0-9]{10,15}',
                r'w\.a\.',
                r'🔊|🎤|📹|📷|📎'
            ]
        }

        self.results = {
            'chat_entries': [],
            'media_files': [],
            'backup_artifacts': [],
            'domains_found': set(),
            'phone_numbers': set(),
            'file_paths': []
        }

    def _find_whatsapp_db(self) -> Path:
        candidates = [
            self.base_path / "databases" / "whatsapp" / "ChatStorage.sqlite",
            self.base_path / "ChatStorage.sqlite",
            self.base_path / "databases" / "whatsapp_chat_storage.sqlite",
            DEFAULT_WHATSAPP_DB,
        ]
        for candidate in candidates:
            if candidate.exists():
                return candidate
        return DEFAULT_WHATSAPP_DB

    def _snapshot_sqlite(self, source: Path, prefix: str) -> Optional[Path]:
        """Snapshot a live SQLite DB plus WAL/SHM sidecars."""
        if not source.exists():
            return None
        tmp = Path(tempfile.mkdtemp(prefix=prefix))
        snapshot = tmp / source.name
        copied = False
        for suffix in ("", "-wal", "-shm"):
            part = Path(str(source) + suffix)
            if part.exists():
                try:
                    shutil.copy2(part, Path(str(snapshot) + suffix))
                    copied = True
                except PermissionError:
                    pass
        return snapshot if copied else None

    def _extract_indicators(self, df: pd.DataFrame) -> None:
        """Extract phone numbers and WhatsApp domains from a message frame."""
        for _, row in df.iterrows():
            for column in ('text', 'chat', 'chat_jid', 'handle'):
                value = row.get(column)
                if not isinstance(value, str):
                    continue
                for jid_match in re.findall(
                    r'(\d{10,15})@s\.whatsapp\.net', value
                ):
                    self.results['phone_numbers'].add(f"+{jid_match}")
                for phone_match in re.findall(
                    r'\+\d[\d\s().\-‑]{8,}\d', value
                ):
                    digits = re.sub(r'\D', '', phone_match)
                    if 10 <= len(digits) <= 15:
                        self.results['phone_numbers'].add(f"+{digits}")
                self.results['phone_numbers'].update(
                    re.findall(r'\+[0-9]{10,15}', value)
                )
                for pattern in self.whatsapp_patterns['domains']:
                    self.results['domains_found'].update(
                        re.findall(pattern, value, re.IGNORECASE)
                    )

    def search_whatsapp_db(self) -> pd.DataFrame:
        """Search WhatsApp ChatStorage.sqlite for messages."""
        chat_db = self.whatsapp_db
        if not chat_db.exists():
            print(f"⚠️  WhatsApp ChatStorage.sqlite not found at {chat_db}")
            return pd.DataFrame()

        snapshot = self._snapshot_sqlite(chat_db, "whatsapp_chatdb_")
        if snapshot is None:
            print(f"⚠️  Could not read WhatsApp database at {chat_db}")
            return pd.DataFrame()

        query = """
        SELECT
            m.Z_PK AS message_id,
            datetime(m.ZMESSAGEDATE + 978307200, 'unixepoch') AS timestamp,
            COALESCE(s.ZPARTNERNAME, s.ZCONTACTJID, m.ZTOJID, m.ZFROMJID) AS chat,
            s.ZCONTACTJID AS chat_jid,
            m.ZTEXT AS text,
            m.ZISFROMME AS is_from_me,
            m.ZMESSAGETYPE AS message_type,
            m.ZMESSAGESTATUS AS message_status,
            m.ZSTANZAID AS stanza_id,
            m.ZMEDIAITEM AS media_item_id
        FROM ZWAMESSAGE m
        LEFT JOIN ZWACHATSESSION s ON s.Z_PK = m.ZCHATSESSION
        ORDER BY m.ZMESSAGEDATE DESC
        """

        conn = sqlite3.connect(str(snapshot))
        try:
            try:
                df = pd.read_sql_query(query, conn)
            except Exception:
                df = pd.read_sql_query("SELECT * FROM ZWAMESSAGE", conn)
        except Exception as e:
            print(f"⚠️  WhatsApp database query failed: {e}")
            conn.close()
            return pd.DataFrame()
        conn.close()

        self._extract_indicators(df)
        return df

    def search_whatsapp_media_items(self) -> pd.DataFrame:
        """Search WhatsApp ChatStorage.sqlite for media item metadata."""
        chat_db = self.whatsapp_db
        if not chat_db.exists():
            return pd.DataFrame()

        snapshot = self._snapshot_sqlite(chat_db, "whatsapp_media_")
        if snapshot is None:
            return pd.DataFrame()

        query = """
        SELECT
            Z_PK AS media_id,
            ZMESSAGE AS message_id,
            ZTITLE AS title,
            ZMEDIALOCALPATH AS local_path,
            ZMEDIAURL AS media_url,
            ZFILESIZE AS file_size,
            datetime(ZMEDIAURLDATE + 978307200, 'unixepoch') AS media_timestamp,
            ZTHUMBNAILLOCALPATH AS thumbnail_path,
            ZVCARDNAME AS vcard_name,
            ZVCARDSTRING AS vcard_string
        FROM ZWAMEDIAITEM
        ORDER BY ZMEDIAURLDATE DESC
        """

        conn = sqlite3.connect(str(snapshot))
        try:
            try:
                return pd.read_sql_query(query, conn)
            except Exception:
                return pd.read_sql_query("SELECT * FROM ZWAMEDIAITEM", conn)
        except Exception as e:
            print(f"⚠️  WhatsApp media query failed: {e}")
            return pd.DataFrame()
        finally:
            conn.close()

    def search_chat_db(self) -> pd.DataFrame:
        """Search iMessage chat.db for WhatsApp-related content"""
        chat_db = self.chat_db
        if not chat_db.exists():
            print(f"⚠️  chat.db not found at {chat_db}")
            return pd.DataFrame()

        # Snapshot the live DB (WAL mode) so we read a consistent copy
        snapshot = self._snapshot_sqlite(chat_db, "whatsapp_imessage_")
        if snapshot is None:
            print(f"⚠️  Could not read chat.db at {chat_db} (permissions?)")
            return pd.DataFrame()

        conn = sqlite3.connect(str(snapshot))
        results = []

        # Build query for WhatsApp patterns
        patterns = " OR ".join([
            f"text LIKE '%{p}%'" for p in [
                'whatsapp', 'wa.me', 'WhatsApp', 'web.whatsapp'
            ]
        ])

        query = f"""
        SELECT
            datetime(date/1000000000 + 978307200, 'unixepoch') as timestamp,
            text,
            handle_id,
            is_from_me,
            service
        FROM message
        WHERE {patterns}
        ORDER BY date DESC
        """

        try:
            df = pd.read_sql_query(query, conn)
        except Exception as e:
            print(f"⚠️  chat.db query failed: {e}")
            conn.close()
            return pd.DataFrame()
        conn.close()

        # Extract phone numbers from messages
        for _, row in df.iterrows():
            # Extract phone numbers (international format)
            phone_pattern = r'\+[0-9]{10,15}'
            numbers = re.findall(phone_pattern, str(row['text']))
            self.results['phone_numbers'].update(numbers)

            # Extract WhatsApp links
            for pattern in self.whatsapp_patterns['domains']:
                matches = re.findall(pattern, str(row['text']), re.IGNORECASE)
                self.results['domains_found'].update(matches)

        self.results['chat_entries'] = df.to_dict('records')
        return df

    def search_media_directories(self) -> List[Dict]:
        """Search for WhatsApp media files"""
        media_paths = [
            self.base_path / "Media",
            self.base_path / "Media/WhatsApp",
            self.base_path / "WhatsApp",
            self.base_path / "Animoji",
            self.base_path / "Message" / "Media",
            Path.home() / "Library" / "Group Containers" /
                "group.net.whatsapp.WhatsApp.shared" / "Message" / "Media",
        ]

        media_files = []
        for path in media_paths:
            if path.exists():
                for ext in ['*.jpg', '*.jpeg', '*.png', '*.mp4', '*.mov',
                            '*.mp3', '*.ogg', '*.aac']:
                    try:
                        for file in path.rglob(ext):
                            if 'whatsapp' in str(file).lower():
                                media_files.append({
                                    'path': str(file),
                                    'size': file.stat().st_size,
                                    'modified': datetime.fromtimestamp(
                                        file.stat().st_mtime).isoformat(),
                                    'extension': file.suffix
                                })
                    except PermissionError:
                        continue

        self.results['media_files'] = media_files
        return media_files

    def analyze_backup_artifacts(self, backup_path: str = None) -> List[Dict]:
        """Analyze iTunes/iCloud backups for WhatsApp data"""
        artifacts = []

        # Check for typical WhatsApp paths in backups
        backup_patterns = [
            "AppDomainGroup-group.net.whatsapp.WhatsApp.shared",
            "Library/SMS/WhatsApp",
            "Documents/WhatsApp",
            "Library/Application Support/WhatsApp"
        ]

        # If backup path provided, search it
        if backup_path:
            backup_dir = Path(backup_path)
            if backup_dir.exists():
                for pattern in backup_patterns:
                    try:
                        for path in backup_dir.rglob(pattern):
                            artifacts.append({
                                'path': str(path),
                                'type': 'backup_artifact',
                                'source': 'iTunes_backup'
                            })
                    except PermissionError:
                        continue

        self.results['backup_artifacts'] = artifacts
        return artifacts

    def scan_system_for_whatsapp(self) -> Dict:
        """Complete system scan for WhatsApp artifacts"""
        print("🔍 Scanning for WhatsApp artifacts...")

        # 1. Search WhatsApp ChatStorage.sqlite
        print("  📱 Searching WhatsApp ChatStorage.sqlite...")
        whatsapp_df = self.search_whatsapp_db()
        if not whatsapp_df.empty:
            whatsapp_df.to_csv(
                self.output_path / "whatsapp_chat_entries.csv", index=False
            )
            print(f"    Found {len(whatsapp_df)} WhatsApp messages")

        print("  🖼️  Searching WhatsApp media item metadata...")
        media_items_df = self.search_whatsapp_media_items()
        if not media_items_df.empty:
            media_items_df.to_csv(
                self.output_path / "whatsapp_media_items.csv", index=False
            )
            print(f"    Found {len(media_items_df)} WhatsApp media item records")

        # 2. Search iMessage chat.db for WhatsApp references
        print("  💬 Searching iMessage chat.db for WhatsApp references...")
        chat_df = self.search_chat_db()
        if not chat_df.empty:
            chat_df.to_csv(
                self.output_path / "imessage_whatsapp_mentions.csv", index=False
            )
            print(f"    Found {len(chat_df)} iMessage WhatsApp mentions")

        # 3. Search media
        print("  🎬 Searching media files...")
        media = self.search_media_directories()
        pd.DataFrame(media).to_csv(
            self.output_path / "whatsapp_media_files.csv", index=False
        )
        print(f"    Found {len(media)} WhatsApp media files")

        # 4. Check SATURN plugins
        print("  🔌 Checking SATURN plugins...")
        saturn_path = Path.home() / "Desktop" / "Rota" / "forensic_modules"
        if saturn_path.exists():
            whatsapp_plugins = list(saturn_path.rglob("*whatsapp*"))
            print(f"    Found {len(whatsapp_plugins)} WhatsApp plugin files")

        # 5. Search iLEAPP
        print("  🛠️  Checking iLEAPP output...")
        ileapp_path = Path.home() / "Desktop" / "iLEAPP"
        if ileapp_path.exists():
            whatsapp_reports = list(ileapp_path.rglob("*whatsapp*"))
            print(f"    Found {len(whatsapp_reports)} iLEAPP WhatsApp reports")

        # 6. Generate summary
        whatsapp_messages = len(whatsapp_df)
        imessage_mentions = len(chat_df)
        media_item_records = len(media_items_df)
        summary = {
            'timestamp': datetime.now().isoformat(),
            'messages_found': whatsapp_messages + imessage_mentions,
            'whatsapp_messages_found': whatsapp_messages,
            'imessage_whatsapp_mentions_found': imessage_mentions,
            'media_files_found': len(media),
            'whatsapp_media_items_found': media_item_records,
            'phone_numbers_found': len(self.results['phone_numbers']),
            'domains_found': list(self.results['domains_found']),
            'whatsapp_contacts': sorted(self.results['phone_numbers'])[:50]
        }

        # Save summary
        summary_path = self.output_path / "whatsapp_forensic_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)

        print("\n✅ WhatsApp forensic analysis complete!")
        print(f"📁 Reports saved to: {self.output_path}")

        return summary


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-path", default=str(DEFAULT_EXTRACT_DIR),
                        help="Forensic extract directory")
    parser.add_argument("--output", default=str(DEFAULT_REPORT_DIR),
                        help="Report output directory")
    parser.add_argument("--chat-db", default=str(DEFAULT_CHAT_DB),
                        help="Path to iMessage chat.db")
    parser.add_argument("--whatsapp-db", default=None,
                        help="Path to WhatsApp ChatStorage.sqlite")
    parser.add_argument("--backup", default=None,
                        help="Optional iTunes/iCloud backup directory")
    args = parser.parse_args()

    extractor = WhatsAppForensics(
        base_path=args.base_path,
        output_path=args.output,
        chat_db=args.chat_db,
        whatsapp_db=args.whatsapp_db,
    )
    if args.backup:
        extractor.analyze_backup_artifacts(args.backup)
    results = extractor.scan_system_for_whatsapp()

    # Print quick stats
    print("\n📊 WhatsApp Artifacts Summary:")
    print(f"  WhatsApp messages: {results['whatsapp_messages_found']}")
    print(f"  iMessage mentions: {results['imessage_whatsapp_mentions_found']}")
    print(f"  Media files found: {results['media_files_found']}")
    print(f"  Media item records: {results['whatsapp_media_items_found']}")
    print(f"  Phone numbers found: {results['phone_numbers_found']}")
    print(f"  Domains found: {len(results['domains_found'])}")


if __name__ == "__main__":
    main()
