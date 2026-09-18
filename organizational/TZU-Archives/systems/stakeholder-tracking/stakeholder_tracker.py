#!/usr/bin/env python3
"""
TZU Stakeholder Sentiment Tracking System
Tracks sentiment across all depots with 2x positive and 1x negative stakeholder ratios
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class SentimentTrend(Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    VOLATILE = "volatile"


class DepotType(Enum):
    CONSORT = "TZI.TR.CON"
    SCRIBE = "TZI.SCR.DEP.BODY"
    CASHINGHOUSE = "TZI.CSH.DEP.SOUL"
    HOLDINGS = "TZI.HLD.DEP.GNOSIS"


@dataclass
class Stakeholder:
    """Individual stakeholder information"""
    id: str
    name: str
    role: str
    contact_info: str
    sentiment_score: float  # -1.0 to 1.0
    influence_level: str  # "high", "medium", "low"
    last_interaction: str
    notes: str = ""


@dataclass
class DepotSentiment:
    """Sentiment tracking for a specific depot"""
    depot_id: str
    depot_name: str
    stakeholders: Dict[str, Stakeholder]
    last_updated: str
    sentiment_trend: SentimentTrend
    overall_sentiment: float
    positive_count: int
    negative_count: int
    neutral_count: int


class StakeholderTracker:
    """Main stakeholder sentiment tracking system"""
    
    def __init__(self, data_path: str = "stakeholder_data.json"):
        self.data_path = data_path
        self.depots: Dict[str, DepotSentiment] = {}
        self.load_data()
    
    def load_data(self):
        """Load stakeholder data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                for depot_id, depot_data in data.items():
                    self.depots[depot_id] = self._deserialize_depot(depot_data)
        except FileNotFoundError:
            self._initialize_default_depots()
    
    def save_data(self):
        """Save stakeholder data to file"""
        data = {}
        for depot_id, depot in self.depots.items():
            data[depot_id] = self._serialize_depot(depot)
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def _initialize_default_depots(self):
        """Initialize default depot structure"""
        depot_configs = {
            DepotType.CONSORT.value: "Consort Depot",
            DepotType.SCRIBE.value: "Scribe Depot", 
            DepotType.CASHINGHOUSE.value: "CashingHouse Depot",
            DepotType.HOLDINGS.value: "Holdings Depot"
        }
        
        for depot_id, depot_name in depot_configs.items():
            self.depots[depot_id] = DepotSentiment(
                depot_id=depot_id,
                depot_name=depot_name,
                stakeholders={},
                last_updated=datetime.datetime.now().isoformat(),
                sentiment_trend=SentimentTrend.STABLE,
                overall_sentiment=0.0,
                positive_count=0,
                negative_count=0,
                neutral_count=0
            )
    
    def add_stakeholder(self, depot_id: str, stakeholder: Stakeholder) -> bool:
        """Add a new stakeholder to a depot"""
        if depot_id not in self.depots:
            return False
        
        self.depots[depot_id].stakeholders[stakeholder.id] = stakeholder
        self._update_depot_sentiment(depot_id)
        self.save_data()
        return True
    
    def update_stakeholder_sentiment(self, depot_id: str, stakeholder_id: str, 
                                     new_score: float, notes: str = "") -> bool:
        """Update sentiment score for a specific stakeholder"""
        if depot_id not in self.depots:
            return False
        
        if stakeholder_id not in self.depots[depot_id].stakeholders:
            return False
        
        stakeholder = self.depots[depot_id].stakeholders[stakeholder_id]
        old_score = stakeholder.sentiment_score
        stakeholder.sentiment_score = new_score
        stakeholder.last_interaction = datetime.datetime.now().isoformat()
        if notes:
            stakeholder.notes = notes
        
        self._update_depot_sentiment(depot_id)
        self._update_sentiment_trend(depot_id, old_score, new_score)
        self.save_data()
        return True
    
    def _update_depot_sentiment(self, depot_id: str):
        """Recalculate depot sentiment metrics"""
        depot = self.depots[depot_id]
        stakeholders = depot.stakeholders
        
        if not stakeholders:
            depot.overall_sentiment = 0.0
            depot.positive_count = 0
            depot.negative_count = 0
            depot.neutral_count = 0
            return
        
        total_score = 0.0
        positive = 0
        negative = 0
        neutral = 0
        
        for stakeholder in stakeholders.values():
            total_score += stakeholder.sentiment_score
            if stakeholder.sentiment_score > 0.3:
                positive += 1
            elif stakeholder.sentiment_score < -0.3:
                negative += 1
            else:
                neutral += 1
        
        depot.overall_sentiment = total_score / len(stakeholders)
        depot.positive_count = positive
        depot.negative_count = negative
        depot.neutral_count = neutral
        depot.last_updated = datetime.datetime.now().isoformat()
    
    def _update_sentiment_trend(self, depot_id: str, old_score: float, new_score: float):
        """Update sentiment trend based on score changes"""
        depot = self.depots[depot_id]
        score_change = new_score - old_score
        
        if abs(score_change) < 0.1:
            depot.sentiment_trend = SentimentTrend.STABLE
        elif score_change > 0:
            depot.sentiment_trend = SentimentTrend.IMPROVING
        else:
            depot.sentiment_trend = SentimentTrend.DECLINING
    
    def get_depot_sentiment(self, depot_id: str) -> Optional[DepotSentiment]:
        """Get sentiment data for a specific depot"""
        return self.depots.get(depot_id)
    
    def get_all_depots_sentiment(self) -> Dict[str, DepotSentiment]:
        """Get sentiment data for all depots"""
        return self.depots
    
    def get_high_risk_stakeholders(self, threshold: float = -0.7) -> List[tuple]:
        """Get stakeholders with negative sentiment below threshold"""
        high_risk = []
        
        for depot_id, depot in self.depots.items():
            for stakeholder_id, stakeholder in depot.stakeholders.items():
                if stakeholder.sentiment_score < threshold:
                    high_risk.append((depot_id, stakeholder_id, stakeholder))
        
        return sorted(high_risk, key=lambda x: x[2].sentiment_score)
    
    def generate_sentiment_report(self) -> str:
        """Generate comprehensive sentiment report"""
        report = []
        report.append("=" * 80)
        report.append("TZU STAKEHOLDER SENTIMENT REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        for depot_id, depot in self.depots.items():
            report.append(f"DEPOT: {depot.depot_name} ({depot_id})")
            report.append(f"Overall Sentiment: {depot.overall_sentiment:.2f}")
            report.append(f"Trend: {depot.sentiment_trend.value}")
            report.append(f"Positive: {depot.positive_count} | Negative: {depot.negative_count} | Neutral: {depot.neutral_count}")
            report.append(f"Total Stakeholders: {len(depot.stakeholders)}")
            report.append("")
            
            if depot.stakeholders:
                report.append("Stakeholder Details:")
                for stakeholder in sorted(depot.stakeholders.values(), 
                                        key=lambda x: x.sentiment_score, reverse=True):
                    sentiment_emoji = "😊" if stakeholder.sentiment_score > 0.3 else "😐" if stakeholder.sentiment_score > -0.3 else "😞"
                    report.append(f"  {sentiment_emoji} {stakeholder.name} ({stakeholder.role}): {stakeholder.sentiment_score:.2f}")
                report.append("")
            
            report.append("-" * 80)
            report.append("")
        
        # High risk stakeholders
        high_risk = self.get_high_risk_stakeholders()
        if high_risk:
            report.append("⚠️  HIGH RISK STAKEHOLDERS (Sentiment < -0.7):")
            for depot_id, stakeholder_id, stakeholder in high_risk:
                report.append(f"  {stakeholder.name} ({depot_id}): {stakeholder.sentiment_score:.2f}")
            report.append("")
        
        return "\n".join(report)
    
    def _serialize_depot(self, depot: DepotSentiment) -> dict:
        """Serialize depot data for JSON storage"""
        return {
            "depot_id": depot.depot_id,
            "depot_name": depot.depot_name,
            "stakeholders": {
                k: asdict(v) for k, v in depot.stakeholders.items()
            },
            "last_updated": depot.last_updated,
            "sentiment_trend": depot.sentiment_trend.value,
            "overall_sentiment": depot.overall_sentiment,
            "positive_count": depot.positive_count,
            "negative_count": depot.negative_count,
            "neutral_count": depot.neutral_count
        }
    
    def _deserialize_depot(self, data: dict) -> DepotSentiment:
        """Deserialize depot data from JSON storage"""
        stakeholders = {}
        for stakeholder_id, stakeholder_data in data["stakeholders"].items():
            stakeholders[stakeholder_id] = Stakeholder(**stakeholder_data)
        
        return DepotSentiment(
            depot_id=data["depot_id"],
            depot_name=data["depot_name"],
            stakeholders=stakeholders,
            last_updated=data["last_updated"],
            sentiment_trend=SentimentTrend(data["sentiment_trend"]),
            overall_sentiment=data["overall_sentiment"],
            positive_count=data["positive_count"],
            negative_count=data["negative_count"],
            neutral_count=data["neutral_count"]
        )


def main():
    """Main function for testing and demonstration"""
    tracker = StakeholderTracker()
    
    # Add sample stakeholders
    sample_stakeholders = [
        Stakeholder(
            id="SH001",
            name="Alex Johnson",
            role="Media Partner",
            contact_info="alex@example.com",
            sentiment_score=0.8,
            influence_level="high",
            last_interaction=datetime.datetime.now().isoformat(),
            notes="Key partner for Consort Depot media operations"
        ),
        Stakeholder(
            id="SH002", 
            name="Maria Garcia",
            role="Investment Advisor",
            contact_info="maria@example.com",
            sentiment_score=0.7,
            influence_level="medium",
            last_interaction=datetime.datetime.now().isoformat(),
            notes="Provides financial guidance for Holdings Depot"
        ),
        Stakeholder(
            id="SH003",
            name="James Wilson",
            role="Legal Counsel",
            contact_info="james@example.com",
            sentiment_score=-0.9,
            influence_level="high",
            last_interaction=datetime.datetime.now().isoformat(),
            notes="Expressed concerns about recent contract terms"
        )
    ]
    
    # Add stakeholders to different depots
    tracker.add_stakeholder(DepotType.CONSORT.value, sample_stakeholders[0])
    tracker.add_stakeholder(DepotType.HOLDINGS.value, sample_stakeholders[1])
    tracker.add_stakeholder(DepotType.SCRIBE.value, sample_stakeholders[2])
    
    # Generate and print report
    print(tracker.generate_sentiment_report())


if __name__ == "__main__":
    main()