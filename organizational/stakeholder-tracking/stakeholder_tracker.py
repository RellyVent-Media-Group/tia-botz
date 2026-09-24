#!/usr/bin/env python3
"""
Stakeholder Tracking System
Depot-level stakeholder management with sentiment scoring and trend analysis
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass, asdict


class DepotType(Enum):
    """Depot types for stakeholder categorization"""
    CONSORT = "Consort"
    SCRIBE = "Scribe"
    CASHINGHOUSE = "CashingHouse"
    HOLDINGS = "Holdings"


class InfluenceLevel(Enum):
    """Stakeholder influence levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SentimentTrend(Enum):
    """Sentiment trend analysis"""
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    UNKNOWN = "unknown"


@dataclass
class Stakeholder:
    """Represents a stakeholder in the system"""
    id: str
    name: str
    role: str
    contact_info: str
    depot: DepotType
    sentiment_score: float  # -1.0 to +1.0
    influence_level: InfluenceLevel
    last_interaction: str  # ISO format datetime
    notes: str = ""
    created_at: str = ""
    updated_at: str = ""
    interaction_history: List[Dict] = None
    
    def __post_init__(self):
        if self.interaction_history is None:
            self.interaction_history = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "contact_info": self.contact_info,
            "depot": self.depot.value,
            "sentiment_score": self.sentiment_score,
            "influence_level": self.influence_level.value,
            "last_interaction": self.last_interaction,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "interaction_history": self.interaction_history
        }


@dataclass
class SentimentRecord:
    """Historical sentiment record for trend analysis"""
    stakeholder_id: str
    score: float
    recorded_at: str
    notes: str = ""
    
    def to_dict(self):
        return {
            "stakeholder_id": self.stakeholder_id,
            "score": self.score,
            "recorded_at": self.recorded_at,
            "notes": self.notes
        }


class StakeholderTracker:
    """Main stakeholder tracking system with sentiment analysis"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Stakeholder Tracking system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.stakeholders_file = os.path.join(self.data_dir, "stakeholders.json")
        self.sentiment_history_file = os.path.join(self.data_dir, "sentiment_history.json")
        
        self.stakeholders: Dict[str, Stakeholder] = {}
        self.sentiment_history: Dict[str, List[SentimentRecord]] = {}
        
        self._load_data()
    
    def _load_data(self):
        """Load stakeholders and sentiment history from JSON files"""
        # Load stakeholders
        if os.path.exists(self.stakeholders_file):
            try:
                with open(self.stakeholders_file, 'r') as f:
                    data = json.load(f)
                    for stakeholder_data in data:
                        stakeholder = Stakeholder(
                            id=stakeholder_data["id"],
                            name=stakeholder_data["name"],
                            role=stakeholder_data["role"],
                            contact_info=stakeholder_data["contact_info"],
                            depot=DepotType(stakeholder_data["depot"]),
                            sentiment_score=stakeholder_data["sentiment_score"],
                            influence_level=InfluenceLevel(stakeholder_data["influence_level"]),
                            last_interaction=stakeholder_data["last_interaction"],
                            notes=stakeholder_data.get("notes", ""),
                            created_at=stakeholder_data.get("created_at", ""),
                            updated_at=stakeholder_data.get("updated_at", ""),
                            interaction_history=stakeholder_data.get("interaction_history", [])
                        )
                        self.stakeholders[stakeholder.id] = stakeholder
            except Exception as e:
                print(f"Error loading stakeholders: {e}")
        
        # Load sentiment history
        if os.path.exists(self.sentiment_history_file):
            try:
                with open(self.sentiment_history_file, 'r') as f:
                    data = json.load(f)
                    for stakeholder_id, records in data.items():
                        self.sentiment_history[stakeholder_id] = [
                            SentimentRecord(**record) for record in records
                        ]
            except Exception as e:
                print(f"Error loading sentiment history: {e}")
    
    def _save_data(self):
        """Save stakeholders and sentiment history to JSON files"""
        try:
            # Save stakeholders
            stakeholders_data = [stakeholder.to_dict() for stakeholder in self.stakeholders.values()]
            with open(self.stakeholders_file, 'w') as f:
                json.dump(stakeholders_data, f, indent=2)
            
            # Save sentiment history
            sentiment_data = {
                stakeholder_id: [record.to_dict() for record in records]
                for stakeholder_id, records in self.sentiment_history.items()
            }
            with open(self.sentiment_history_file, 'w') as f:
                json.dump(sentiment_data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def add_stakeholder(self, stakeholder: Stakeholder) -> bool:
        """Add a new stakeholder to the system"""
        if stakeholder.id in self.stakeholders:
            return False
        
        self.stakeholders[stakeholder.id] = stakeholder
        
        # Initialize sentiment history
        self.sentiment_history[stakeholder.id] = [
            SentimentRecord(
                stakeholder_id=stakeholder.id,
                score=stakeholder.sentiment_score,
                recorded_at=datetime.now().isoformat(),
                notes="Initial sentiment score"
            )
        ]
        
        self._save_data()
        return True
    
    def update_stakeholder(self, stakeholder_id: str, **kwargs) -> bool:
        """Update stakeholder information"""
        if stakeholder_id not in self.stakeholders:
            return False
        
        stakeholder = self.stakeholders[stakeholder_id]
        
        for key, value in kwargs.items():
            if hasattr(stakeholder, key):
                setattr(stakeholder, key, value)
        
        stakeholder.updated_at = datetime.now().isoformat()
        self._save_data()
        return True
    
    def update_sentiment(self, stakeholder_id: str, new_score: float, notes: str = "") -> bool:
        """Update stakeholder sentiment score and record in history"""
        if stakeholder_id not in self.stakeholders:
            return False
        
        if not -1.0 <= new_score <= 1.0:
            print("Sentiment score must be between -1.0 and +1.0")
            return False
        
        # Update current sentiment
        self.stakeholders[stakeholder_id].sentiment_score = new_score
        self.stakeholders[stakeholder_id].updated_at = datetime.now().isoformat()
        
        # Add to history
        record = SentimentRecord(
            stakeholder_id=stakeholder_id,
            score=new_score,
            recorded_at=datetime.now().isoformat(),
            notes=notes
        )
        self.sentiment_history[stakeholder_id].append(record)
        
        self._save_data()
        return True
    
    def record_interaction(self, stakeholder_id: str, interaction_type: str, notes: str = "") -> bool:
        """Record an interaction with a stakeholder"""
        if stakeholder_id not in self.stakeholders:
            return False
        
        interaction = {
            "type": interaction_type,
            "timestamp": datetime.now().isoformat(),
            "notes": notes
        }
        
        self.stakeholders[stakeholder_id].interaction_history.append(interaction)
        self.stakeholders[stakeholder_id].last_interaction = datetime.now().isoformat()
        self.stakeholders[stakeholder_id].updated_at = datetime.now().isoformat()
        
        self._save_data()
        return True
    
    def get_stakeholder(self, stakeholder_id: str) -> Optional[Stakeholder]:
        """Get a specific stakeholder by ID"""
        return self.stakeholders.get(stakeholder_id)
    
    def get_stakeholders_by_depot(self, depot: DepotType) -> List[Stakeholder]:
        """Get all stakeholders for a specific depot"""
        return [s for s in self.stakeholders.values() if s.depot == depot]
    
    def analyze_sentiment_trend(self, stakeholder_id: str, days: int = 30) -> SentimentTrend:
        """Analyze sentiment trend for a stakeholder over the past N days"""
        if stakeholder_id not in self.sentiment_history:
            return SentimentTrend.UNKNOWN
        
        records = self.sentiment_history[stakeholder_id]
        if len(records) < 2:
            return SentimentTrend.UNKNOWN
        
        # Filter records from the past N days
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_records = [r for r in records if datetime.fromisoformat(r.recorded_at) >= cutoff_date]
        
        if len(recent_records) < 2:
            return SentimentTrend.UNKNOWN
        
        # Calculate trend
        oldest_score = recent_records[0].score
        newest_score = recent_records[-1].score
        score_change = newest_score - oldest_score
        
        if score_change > 0.1:
            return SentimentTrend.IMPROVING
        elif score_change < -0.1:
            return SentimentTrend.DECLINING
        else:
            return SentimentTrend.STABLE
    
    def get_high_risk_stakeholders(self, threshold: float = -0.3) -> List[Stakeholder]:
        """Get stakeholders with sentiment scores below threshold"""
        return [
            s for s in self.stakeholders.values()
            if s.sentiment_score < threshold
        ]
    
    def get_high_value_stakeholders(self) -> List[Stakeholder]:
        """Get stakeholders with high influence and positive sentiment"""
        return [
            s for s in self.stakeholders.values()
            if s.influence_level in [InfluenceLevel.HIGH, InfluenceLevel.CRITICAL]
            and s.sentiment_score > 0.5
        ]
    
    def generate_sentiment_report(self, depot: DepotType = None) -> Dict:
        """Generate a comprehensive sentiment analysis report"""
        stakeholders = list(self.stakeholders.values())
        
        if depot:
            stakeholders = [s for s in stakeholders if s.depot == depot]
        
        if not stakeholders:
            return {"error": "No stakeholders found"}
        
        # Calculate metrics
        total_stakeholders = len(stakeholders)
        avg_sentiment = sum(s.sentiment_score for s in stakeholders) / total_stakeholders
        
        # Categorize by sentiment
        positive = [s for s in stakeholders if s.sentiment_score > 0.3]
        neutral = [s for s in stakeholders if -0.3 <= s.sentiment_score <= 0.3]
        negative = [s for s in stakeholders if s.sentiment_score < -0.3]
        
        # Categorize by influence
        high_influence = [s for s in stakeholders if s.influence_level in [InfluenceLevel.HIGH, InfluenceLevel.CRITICAL]]
        
        # Calculate trends
        improving = []
        declining = []
        stable = []
        
        for stakeholder in stakeholders:
            trend = self.analyze_sentiment_trend(stakeholder.id)
            if trend == SentimentTrend.IMPROVING:
                improving.append(stakeholder)
            elif trend == SentimentTrend.DECLINING:
                declining.append(stakeholder)
            elif trend == SentimentTrend.STABLE:
                stable.append(stakeholder)
        
        # Depot breakdown
        depot_breakdown = {}
        for depot_type in DepotType:
            depot_stakeholders = [s for s in stakeholders if s.depot == depot_type]
            if depot_stakeholders:
                depot_avg = sum(s.sentiment_score for s in depot_stakeholders) / len(depot_stakeholders)
                depot_breakdown[depot_type.value] = {
                    "count": len(depot_stakeholders),
                    "average_sentiment": depot_avg,
                    "high_risk": len([s for s in depot_stakeholders if s.sentiment_score < -0.3])
                }
        
        return {
            "report_date": datetime.now().isoformat(),
            "depot_filter": depot.value if depot else "All Depots",
            "total_stakeholders": total_stakeholders,
            "average_sentiment": round(avg_sentiment, 3),
            "sentiment_distribution": {
                "positive": len(positive),
                "neutral": len(neutral),
                "negative": len(negative)
            },
            "influence_analysis": {
                "high_influence_count": len(high_influence),
                "high_influence_avg_sentiment": round(
                    sum(s.sentiment_score for s in high_influence) / len(high_influence), 3
                ) if high_influence else 0
            },
            "trend_analysis": {
                "improving": len(improving),
                "stable": len(stable),
                "declining": len(declining)
            },
            "high_risk_stakeholders": len(self.get_high_risk_stakeholders()),
            "high_value_stakeholders": len(self.get_high_value_stakeholders()),
            "depot_breakdown": depot_breakdown,
            "recent_interactions": sum(len(s.interaction_history) for s in stakeholders)
        }
    
    def generate_stakeholder_alerts(self) -> List[Dict]:
        """Generate alerts for stakeholders requiring attention"""
        alerts = []
        
        # High risk stakeholders
        high_risk = self.get_high_risk_stakeholders()
        for stakeholder in high_risk:
            alerts.append({
                "type": "high_risk",
                "severity": "high",
                "stakeholder_id": stakeholder.id,
                "stakeholder_name": stakeholder.name,
                "message": f"Stakeholder has low sentiment score ({stakeholder.sentiment_score})",
                "depot": stakeholder.depot.value,
                "influence": stakeholder.influence_level.value
            })
        
        # Declining trends
        for stakeholder in self.stakeholders.values():
            trend = self.analyze_sentiment_trend(stakeholder.id)
            if trend == SentimentTrend.DECLINING:
                alerts.append({
                    "type": "declining_trend",
                    "severity": "medium",
                    "stakeholder_id": stakeholder.id,
                    "stakeholder_name": stakeholder.name,
                    "message": "Stakeholder sentiment is declining",
                    "depot": stakeholder.depot.value,
                    "current_score": stakeholder.sentiment_score
                })
        
        # No recent interaction (30+ days)
        cutoff_date = datetime.now() - timedelta(days=30)
        for stakeholder in self.stakeholders.values():
            if stakeholder.influence_level in [InfluenceLevel.HIGH, InfluenceLevel.CRITICAL]:
                last_interaction = datetime.fromisoformat(stakeholder.last_interaction)
                if last_interaction < cutoff_date:
                    alerts.append({
                        "type": "no_recent_contact",
                        "severity": "medium",
                        "stakeholder_id": stakeholder.id,
                        "stakeholder_name": stakeholder.name,
                        "message": f"No interaction in 30+ days (last: {stakeholder.last_interaction})",
                        "depot": stakeholder.depot.value
                    })
        
        return sorted(alerts, key=lambda x: (x["severity"], x["type"]), reverse=True)


def main():
    """Example usage of the Stakeholder Tracking system"""
    tracker = StakeholderTracker()
    
    print("=== Stakeholder Tracking System ===")
    print()
    
    # Example: Add a stakeholder
    sample_stakeholder = Stakeholder(
        id="SH001",
        name="Alex Johnson",
        role="Media Partner",
        contact_info="alex@example.com",
        depot=DepotType.CONSORT,
        sentiment_score=0.8,
        influence_level=InfluenceLevel.HIGH,
        last_interaction=datetime.now().isoformat(),
        notes="Key media contact for content distribution"
    )
    
    if tracker.add_stakeholder(sample_stakeholder):
        print(f"Added stakeholder: {sample_stakeholder.name}")
    print()
    
    # Generate sentiment report
    report = tracker.generate_sentiment_report()
    print("=== Sentiment Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Generate alerts
    alerts = tracker.generate_stakeholder_alerts()
    print("=== Stakeholder Alerts ===")
    for alert in alerts:
        print(f"{alert['severity'].upper()}: {alert['message']}")
        print(f"  Stakeholder: {alert['stakeholder_name']}")
        print()


# Export main classes for module import
__all__ = [
    'StakeholderTracker',
    'Stakeholder',
    'SentimentRecord',
    'DepotType',
    'InfluenceLevel',
    'SentimentTrend'
]


if __name__ == "__main__":
    main()