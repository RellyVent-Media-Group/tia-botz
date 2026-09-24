#!/usr/bin/env python3
"""
Scribe Depot - Document Manager Automation
Document lifecycle management with contract automation and version control
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass


class DocumentType(Enum):
    """Types of documents for Scribe Depot"""
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    PROPOSAL = "proposal"
    REPORT = "report"
    DOCUMENTATION = "documentation"
    TEMPLATE = "template"


class DocumentStatus(Enum):
    """Status of documents in the system"""
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    ACTIVE = "active"
    EXPIRED = "expired"
    ARCHIVED = "archived"


class ContractType(Enum):
    """Types of contracts"""
    SERVICE = "service"
    PARTNERSHIP = "partnership"
    EMPLOYMENT = "employment"
    LICENSE = "license"
    NDA = "nda"


@dataclass
class Document:
    """Represents a document in the system"""
    id: str
    title: str
    document_type: DocumentType
    status: DocumentStatus
    file_path: str
    version: str = "1.0"
    description: str = ""
    created_at: str = ""
    updated_at: str = ""
    expiry_date: Optional[str] = None
    tags: List[str] = None
    author: str = ""
    related_party: str = ""
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "document_type": self.document_type.value,
            "status": self.status.value,
            "file_path": self.file_path,
            "version": self.version,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "expiry_date": self.expiry_date,
            "tags": self.tags,
            "author": self.author,
            "related_party": self.related_party
        }


@dataclass
class Contract:
    """Represents a contract with additional contract-specific fields"""
    id: str
    title: str
    contract_type: ContractType
    status: DocumentStatus
    file_path: str
    start_date: str
    end_date: str
    value: float = 0.0
    payment_terms: str = ""
    renewal_option: bool = False
    auto_renew: bool = False
    description: str = ""
    created_at: str = ""
    updated_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "contract_type": self.contract_type.value,
            "status": self.status.value,
            "file_path": self.file_path,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "value": self.value,
            "payment_terms": self.payment_terms,
            "renewal_option": self.renewal_option,
            "auto_renew": self.auto_renew,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


class DocumentManager:
    """Main document management system for Scribe Depot"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Document Manager system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.documents_file = os.path.join(self.data_dir, "documents.json")
        self.contracts_file = os.path.join(self.data_dir, "contracts.json")
        self.versions_file = os.path.join(self.data_dir, "document_versions.json")
        
        self.documents: Dict[str, Document] = {}
        self.contracts: Dict[str, Contract] = {}
        self.document_versions: Dict[str, List[Dict]] = {}  # document_id -> version history
        
        self._load_data()
    
    def _load_data(self):
        """Load documents, contracts, and versions from JSON files"""
        # Load documents
        if os.path.exists(self.documents_file):
            try:
                with open(self.documents_file, 'r') as f:
                    data = json.load(f)
                    for doc_data in data:
                        doc = Document(
                            id=doc_data["id"],
                            title=doc_data["title"],
                            document_type=DocumentType(doc_data["document_type"]),
                            status=DocumentStatus(doc_data["status"]),
                            file_path=doc_data["file_path"],
                            version=doc_data.get("version", "1.0"),
                            description=doc_data.get("description", ""),
                            created_at=doc_data.get("created_at", ""),
                            updated_at=doc_data.get("updated_at", ""),
                            expiry_date=doc_data.get("expiry_date"),
                            tags=doc_data.get("tags", []),
                            author=doc_data.get("author", ""),
                            related_party=doc_data.get("related_party", "")
                        )
                        self.documents[doc.id] = doc
            except Exception as e:
                print(f"Error loading documents: {e}")
        
        # Load contracts
        if os.path.exists(self.contracts_file):
            try:
                with open(self.contracts_file, 'r') as f:
                    data = json.load(f)
                    for contract_data in data:
                        contract = Contract(
                            id=contract_data["id"],
                            title=contract_data["title"],
                            contract_type=ContractType(contract_data["contract_type"]),
                            status=DocumentStatus(contract_data["status"]),
                            file_path=contract_data["file_path"],
                            start_date=contract_data["start_date"],
                            end_date=contract_data["end_date"],
                            value=contract_data.get("value", 0.0),
                            payment_terms=contract_data.get("payment_terms", ""),
                            renewal_option=contract_data.get("renewal_option", False),
                            auto_renew=contract_data.get("auto_renew", False),
                            description=contract_data.get("description", ""),
                            created_at=contract_data.get("created_at", ""),
                            updated_at=contract_data.get("updated_at", "")
                        )
                        self.contracts[contract.id] = contract
            except Exception as e:
                print(f"Error loading contracts: {e}")
        
        # Load document versions
        if os.path.exists(self.versions_file):
            try:
                with open(self.versions_file, 'r') as f:
                    self.document_versions = json.load(f)
            except Exception as e:
                print(f"Error loading document versions: {e}")
    
    def _save_data(self):
        """Save documents, contracts, and versions to JSON files"""
        try:
            # Save documents
            documents_data = [doc.to_dict() for doc in self.documents.values()]
            with open(self.documents_file, 'w') as f:
                json.dump(documents_data, f, indent=2)
            
            # Save contracts
            contracts_data = [contract.to_dict() for contract in self.contracts.values()]
            with open(self.contracts_file, 'w') as f:
                json.dump(contracts_data, f, indent=2)
            
            # Save document versions
            with open(self.versions_file, 'w') as f:
                json.dump(self.document_versions, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def add_document(self, document: Document) -> bool:
        """Add a new document to the system"""
        if document.id in self.documents:
            return False
        
        self.documents[document.id] = document
        
        # Initialize version history
        self.document_versions[document.id] = [{
            "version": document.version,
            "created_at": document.created_at,
            "author": document.author,
            "notes": "Initial version"
        }]
        
        self._save_data()
        return True
    
    def add_contract(self, contract: Contract) -> bool:
        """Add a new contract to the system"""
        if contract.id in self.contracts:
            return False
        
        self.contracts[contract.id] = contract
        self._save_data()
        return True
    
    def update_document_status(self, document_id: str, new_status: DocumentStatus) -> bool:
        """Update the status of a document"""
        if document_id not in self.documents:
            return False
        
        self.documents[document_id].status = new_status
        self.documents[document_id].updated_at = datetime.now().isoformat()
        self._save_data()
        return True
    
    def update_contract_status(self, contract_id: str, new_status: DocumentStatus) -> bool:
        """Update the status of a contract"""
        if contract_id not in self.contracts:
            return False
        
        self.contracts[contract_id].status = new_status
        self.contracts[contract_id].updated_at = datetime.now().isoformat()
        self._save_data()
        return True
    
    def create_document_version(self, document_id: str, new_version: str, author: str, notes: str = "") -> bool:
        """Create a new version of a document"""
        if document_id not in self.documents:
            return False
        
        # Update document version
        self.documents[document_id].version = new_version
        self.documents[document_id].updated_at = datetime.now().isoformat()
        
        # Add to version history
        version_record = {
            "version": new_version,
            "created_at": datetime.now().isoformat(),
            "author": author,
            "notes": notes
        }
        self.document_versions[document_id].append(version_record)
        
        self._save_data()
        return True
    
    def get_documents_by_status(self, status: DocumentStatus) -> List[Document]:
        """Get all documents with a specific status"""
        return [doc for doc in self.documents.values() if doc.status == status]
    
    def get_documents_by_type(self, document_type: DocumentType) -> List[Document]:
        """Get all documents of a specific type"""
        return [doc for doc in self.documents.values() if doc.document_type == document_type]
    
    def get_contracts_by_status(self, status: DocumentStatus) -> List[Contract]:
        """Get all contracts with a specific status"""
        return [contract for contract in self.contracts.values() if contract.status == status]
    
    def get_expiring_contracts(self, days: int = 30) -> List[Contract]:
        """Get contracts expiring within the next N days"""
        cutoff_date = (date.today() + timedelta(days=days)).isoformat()
        expiring = []
        
        for contract in self.contracts.values():
            if contract.end_date <= cutoff_date and contract.status not in [DocumentStatus.EXPIRED, DocumentStatus.ARCHIVED]:
                expiring.append(contract)
        
        return sorted(expiring, key=lambda c: c.end_date)
    
    def get_expired_documents(self) -> List[Document]:
        """Get documents that have expired"""
        today = date.today().isoformat()
        expired = []
        
        for document in self.documents.values():
            if document.expiry_date and document.expiry_date < today:
                expired.append(document)
        
        return expired
    
    def search_documents(self, query: str) -> List[Document]:
        """Search documents by title, description, or tags"""
        query_lower = query.lower()
        results = []
        
        for document in self.documents.values():
            if (query_lower in document.title.lower() or
                query_lower in document.description.lower() or
                any(query_lower in tag.lower() for tag in document.tags)):
                results.append(document)
        
        return results
    
    def get_document_queue(self) -> Dict:
        """Get document processing queue and priorities"""
        queue = {
            "urgent": [],
            "high_priority": [],
            "normal_priority": [],
            "low_priority": []
        }
        
        # Expiring contracts are urgent
        for contract in self.get_expiring_contracts(7):
            queue["urgent"].append({
                "id": contract.id,
                "title": contract.title,
                "type": "contract",
                "reason": f"Expires on {contract.end_date}",
                "days_until_expiry": (date.fromisoformat(contract.end_date) - date.today()).days
            })
        
        # Documents in review
        for document in self.get_documents_by_status(DocumentStatus.REVIEW):
            queue["high_priority"].append({
                "id": document.id,
                "title": document.title,
                "type": "document",
                "reason": "Awaiting review"
            })
        
        # Draft documents
        for document in self.get_documents_by_status(DocumentStatus.DRAFT):
            queue["normal_priority"].append({
                "id": document.id,
                "title": document.title,
                "type": "document",
                "reason": "Draft status"
            })
        
        return queue
    
    def generate_contract_alerts(self) -> List[Dict]:
        """Generate alerts for contracts requiring attention"""
        alerts = []
        
        # Expiring soon (7 days)
        for contract in self.get_expiring_contracts(7):
            days_left = (date.fromisoformat(contract.end_date) - date.today()).days
            alerts.append({
                "type": "expiring_soon",
                "severity": "high",
                "contract_id": contract.id,
                "contract_title": contract.title,
                "message": f"Contract expires in {days_left} days",
                "end_date": contract.end_date,
                "renewal_option": contract.renewal_option
            })
        
        # Expiring in 30 days
        for contract in self.get_expiring_contracts(30):
            if contract not in [a["contract_id"] for a in alerts if a["type"] == "expiring_soon"]:
                days_left = (date.fromisoformat(contract.end_date) - date.today()).days
                alerts.append({
                    "type": "expiring_soon",
                    "severity": "medium",
                    "contract_id": contract.id,
                    "contract_title": contract.title,
                    "message": f"Contract expires in {days_left} days",
                    "end_date": contract.end_date,
                    "renewal_option": contract.renewal_option
                })
        
        # Expired contracts not yet marked
        for contract in self.contracts.values():
            if contract.end_date < date.today().isoformat() and contract.status != DocumentStatus.EXPIRED:
                alerts.append({
                    "type": "expired",
                    "severity": "high",
                    "contract_id": contract.id,
                    "contract_title": contract.title,
                    "message": f"Contract expired on {contract.end_date}",
                    "end_date": contract.end_date
                })
        
        return sorted(alerts, key=lambda x: (x["severity"], x["type"]), reverse=True)
    
    def generate_document_report(self) -> Dict:
        """Generate a comprehensive document management report"""
        total_documents = len(self.documents)
        total_contracts = len(self.contracts)
        
        # Document status breakdown
        status_breakdown = {}
        for status in DocumentStatus:
            status_breakdown[status.value] = len(self.get_documents_by_status(status))
        
        # Document type breakdown
        type_breakdown = {}
        for doc_type in DocumentType:
            type_breakdown[doc_type.value] = len(self.get_documents_by_type(doc_type))
        
        # Contract status breakdown
        contract_status_breakdown = {}
        for status in DocumentStatus:
            contract_status_breakdown[status.value] = len(self.get_contracts_by_status(status))
        
        # Contract value summary
        active_contracts = [c for c in self.contracts.values() if c.status == DocumentStatus.ACTIVE]
        total_contract_value = sum(c.value for c in active_contracts)
        
        return {
            "report_date": datetime.now().isoformat(),
            "total_documents": total_documents,
            "total_contracts": total_contracts,
            "document_status_breakdown": status_breakdown,
            "document_type_breakdown": type_breakdown,
            "contract_status_breakdown": contract_status_breakdown,
            "active_contracts": len(active_contracts),
            "total_contract_value": total_contract_value,
            "expiring_contracts_30_days": len(self.get_expiring_contracts(30)),
            "expired_documents": len(self.get_expired_documents()),
            "document_queue": self.get_document_queue()
        }


def main():
    """Example usage of the Scribe Document Manager system"""
    manager = DocumentManager()
    
    print("=== Scribe Depot - Document Manager ===")
    print()
    
    # Example: Add a document
    sample_document = Document(
        id=f"doc_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        title="Partnership Agreement Template",
        document_type=DocumentType.TEMPLATE,
        status=DocumentStatus.APPROVED,
        file_path="/documents/templates/partnership_agreement.docx",
        version="1.0",
        description="Standard partnership agreement template for external partners",
        author="Scribe Depot",
        tags=["template", "partnership", "legal"]
    )
    
    if manager.add_document(sample_document):
        print(f"Added document: {sample_document.title}")
    print()
    
    # Example: Add a contract
    sample_contract = Contract(
        id=f"contract_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        title="Media Partnership Contract",
        contract_type=ContractType.PARTNERSHIP,
        status=DocumentStatus.ACTIVE,
        file_path="/contracts/2024/media_partnership_001.pdf",
        start_date="2024-01-01",
        end_date="2024-12-31",
        value=50000.0,
        payment_terms="Monthly payments",
        renewal_option=True,
        auto_renew=False,
        description="Partnership agreement with media distribution platform"
    )
    
    if manager.add_contract(sample_contract):
        print(f"Added contract: {sample_contract.title}")
    print()
    
    # Generate document report
    report = manager.generate_document_report()
    print("=== Document Management Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Generate contract alerts
    alerts = manager.generate_contract_alerts()
    print("=== Contract Alerts ===")
    for alert in alerts:
        print(f"{alert['severity'].upper()}: {alert['message']}")
        print(f"  Contract: {alert['contract_title']}")
        print()


# Export main classes for module import
__all__ = [
    'DocumentManager',
    'Document',
    'Contract',
    'DocumentType',
    'DocumentStatus',
    'ContractType'
]


if __name__ == "__main__":
    main()