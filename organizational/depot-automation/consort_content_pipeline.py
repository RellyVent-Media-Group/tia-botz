#!/usr/bin/env python3
"""
Consort Depot - Content Pipeline Automation
Content creation pipeline management with social media automation and character consistency
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass


class ContentType(Enum):
    """Types of content for Consort Depot"""
    CHARACTER_REVEAL = "character_reveal"
    POSTER_SHOWCASE = "poster_showcase"
    AVATAR_SPOTLIGHT = "avatar_spotlight"
    STORY_PREVIEW = "story_preview"


class Platform(Enum):
    """Social media platforms for Consort Depot"""
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TWITTER = "twitter"


class ContentStatus(Enum):
    """Status of content in the pipeline"""
    IDEA = "idea"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    SCHEDULED = "scheduled"
    POSTED = "posted"
    ARCHIVED = "archived"


@dataclass
class ContentItem:
    """Represents a content item in the pipeline"""
    id: str
    title: str
    content_type: ContentType
    platform: Platform
    character: str  # Mac or Mary
    status: ContentStatus
    description: str = ""
    scheduled_date: Optional[str] = None
    posted_date: Optional[str] = None
    engagement_metrics: Dict = None
    notes: str = ""
    created_at: str = ""
    updated_at: str = ""
    
    def __post_init__(self):
        if self.engagement_metrics is None:
            self.engagement_metrics = {}
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content_type": self.content_type.value,
            "platform": self.platform.value,
            "character": self.character,
            "status": self.status.value,
            "description": self.description,
            "scheduled_date": self.scheduled_date,
            "posted_date": self.posted_date,
            "engagement_metrics": self.engagement_metrics,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


class ContentPipeline:
    """Main content pipeline management system for Consort Depot"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Content Pipeline system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.content_file = os.path.join(self.data_dir, "content_pipeline.json")
        self.content_calendar_file = os.path.join(self.data_dir, "content_calendar.json")
        
        self.content_items: Dict[str, ContentItem] = {}
        self.content_calendar: Dict[str, List[str]] = {}  # date -> content_ids
        
        self._load_data()
    
    def _load_data(self):
        """Load content items and calendar from JSON files"""
        # Load content items
        if os.path.exists(self.content_file):
            try:
                with open(self.content_file, 'r') as f:
                    data = json.load(f)
                    for item_data in data:
                        item = ContentItem(
                            id=item_data["id"],
                            title=item_data["title"],
                            content_type=ContentType(item_data["content_type"]),
                            platform=Platform(item_data["platform"]),
                            character=item_data["character"],
                            status=ContentStatus(item_data["status"]),
                            description=item_data.get("description", ""),
                            scheduled_date=item_data.get("scheduled_date"),
                            posted_date=item_data.get("posted_date"),
                            engagement_metrics=item_data.get("engagement_metrics", {}),
                            notes=item_data.get("notes", ""),
                            created_at=item_data.get("created_at", ""),
                            updated_at=item_data.get("updated_at", "")
                        )
                        self.content_items[item.id] = item
            except Exception as e:
                print(f"Error loading content items: {e}")
        
        # Load content calendar
        if os.path.exists(self.content_calendar_file):
            try:
                with open(self.content_calendar_file, 'r') as f:
                    self.content_calendar = json.load(f)
            except Exception as e:
                print(f"Error loading content calendar: {e}")
    
    def _save_data(self):
        """Save content items and calendar to JSON files"""
        try:
            # Save content items
            content_data = [item.to_dict() for item in self.content_items.values()]
            with open(self.content_file, 'w') as f:
                json.dump(content_data, f, indent=2)
            
            # Save content calendar
            with open(self.content_calendar_file, 'w') as f:
                json.dump(self.content_calendar, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def add_content_item(self, item: ContentItem) -> bool:
        """Add a new content item to the pipeline"""
        if item.id in self.content_items:
            return False
        
        self.content_items[item.id] = item
        self._save_data()
        return True
    
    def update_content_status(self, content_id: str, new_status: ContentStatus) -> bool:
        """Update the status of a content item"""
        if content_id not in self.content_items:
            return False
        
        self.content_items[content_id].status = new_status
        self.content_items[content_id].updated_at = datetime.now().isoformat()
        
        # Handle status-specific actions
        if new_status == ContentStatus.POSTED:
            self.content_items[content_id].posted_date = datetime.now().isoformat()
        
        self._save_data()
        return True
    
    def schedule_content(self, content_id: str, scheduled_date: str) -> bool:
        """Schedule content for a specific date"""
        if content_id not in self.content_items:
            return False
        
        self.content_items[content_id].scheduled_date = scheduled_date
        self.content_items[content_id].status = ContentStatus.SCHEDULED
        self.content_items[content_id].updated_at = datetime.now().isoformat()
        
        # Add to calendar
        if scheduled_date not in self.content_calendar:
            self.content_calendar[scheduled_date] = []
        self.content_calendar[scheduled_date].append(content_id)
        
        self._save_data()
        return True
    
    def update_engagement_metrics(self, content_id: str, metrics: Dict) -> bool:
        """Update engagement metrics for posted content"""
        if content_id not in self.content_items:
            return False
        
        self.content_items[content_id].engagement_metrics.update(metrics)
        self.content_items[content_id].updated_at = datetime.now().isoformat()
        self._save_data()
        return True
    
    def get_content_by_status(self, status: ContentStatus) -> List[ContentItem]:
        """Get all content items with a specific status"""
        return [item for item in self.content_items.values() if item.status == status]
    
    def get_content_by_platform(self, platform: Platform) -> List[ContentItem]:
        """Get all content items for a specific platform"""
        return [item for item in self.content_items.values() if item.platform == platform]
    
    def get_content_by_character(self, character: str) -> List[ContentItem]:
        """Get all content items for a specific character (Mac or Mary)"""
        return [item for item in self.content_items.values() if item.character == character]
    
    def generate_30_day_calendar(self) -> Dict:
        """Generate a 30-day content calendar with content type distribution"""
        calendar = {}
        content_types = list(ContentType)
        
        for i in range(30):
            future_date = (date.today() + timedelta(days=i)).isoformat()
            daily_content = []
            
            # Distribute content types across the 30 days
            for j, content_type in enumerate(content_types):
                if (i + j) % 4 == 0:  # Distribute evenly
                    platforms = [Platform.TIKTOK, Platform.INSTAGRAM, Platform.YOUTUBE]
                    for platform in platforms:
                        if (i + j + list(platforms).index(platform)) % 3 == 0:
                            daily_content.append({
                                "content_type": content_type.value,
                                "platform": platform.value,
                                "character": "Mac" if (i + j) % 2 == 0 else "Mary",
                                "suggested_time": self._get_optimal_posting_time(platform)
                            })
            
            calendar[future_date] = daily_content
        
        return calendar
    
    def _get_optimal_posting_time(self, platform: Platform) -> str:
        """Get optimal posting time for a platform"""
        optimal_times = {
            Platform.TIKTOK: "12:00 PM - 3:00 PM",
            Platform.INSTAGRAM: "11:00 AM - 1:00 PM",
            Platform.YOUTUBE: "2:00 PM - 4:00 PM",
            Platform.TWITTER: "9:00 AM - 11:00 AM"
        }
        return optimal_times.get(platform, "12:00 PM")
    
    def check_character_consistency(self) -> Dict:
        """Check character consistency across content (Mac & Mary)"""
        mac_content = self.get_content_by_character("Mac")
        mary_content = self.get_content_by_character("Mary")
        
        total_content = len(self.content_items)
        mac_percentage = (len(mac_content) / total_content * 100) if total_content > 0 else 0
        mary_percentage = (len(mary_content) / total_content * 100) if total_content > 0 else 0
        
        # Check for recent balance
        recent_date = (date.today() - timedelta(days=7)).isoformat()
        recent_mac = [c for c in mac_content if c.created_at >= recent_date]
        recent_mary = [c for c in mary_content if c.created_at >= recent_date]
        
        return {
            "total_content": total_content,
            "mac_content_count": len(mac_content),
            "mary_content_count": len(mary_content),
            "mac_percentage": round(mac_percentage, 1),
            "mary_percentage": round(mary_percentage, 1),
            "recent_mac_content": len(recent_mac),
            "recent_mary_content": len(recent_mary),
            "balance_score": self._calculate_balance_score(len(recent_mac), len(recent_mary)),
            "recommendations": self._generate_consistency_recommendations(len(recent_mac), len(recent_mary))
        }
    
    def _calculate_balance_score(self, mac_count: int, mary_count: int) -> float:
        """Calculate a balance score between Mac and Mary content"""
        total = mac_count + mary_count
        if total == 0:
            return 100.0  # Perfect balance when no content
        
        ratio = min(mac_count, mary_count) / total
        return ratio * 100
    
    def _generate_consistency_recommendations(self, mac_count: int, mary_count: int) -> List[str]:
        """Generate recommendations for character consistency"""
        recommendations = []
        
        if mac_count == 0 and mary_count == 0:
            recommendations.append("Start creating content for both Mac and Mary characters")
        elif mac_count > mary_count * 2:
            recommendations.append("Consider creating more Mary content to balance character representation")
        elif mary_count > mac_count * 2:
            recommendations.append("Consider creating more Mac content to balance character representation")
        else:
            recommendations.append("Character content is well balanced")
        
        return recommendations
    
    def generate_performance_report(self, days: int = 30) -> Dict:
        """Generate performance report for content in the past N days"""
        cutoff_date = (date.today() - timedelta(days=days)).isoformat()
        recent_content = [
            item for item in self.content_items.values()
            if item.posted_date and item.posted_date >= cutoff_date
        ]
        
        if not recent_content:
            return {"message": f"No content posted in the past {days} days"}
        
        # Calculate metrics
        total_views = sum(item.engagement_metrics.get("views", 0) for item in recent_content)
        total_likes = sum(item.engagement_metrics.get("likes", 0) for item in recent_content)
        total_shares = sum(item.engagement_metrics.get("shares", 0) for item in recent_content)
        total_comments = sum(item.engagement_metrics.get("comments", 0) for item in recent_content)
        
        # Platform breakdown
        platform_performance = {}
        for platform in Platform:
            platform_content = [item for item in recent_content if item.platform == platform]
            if platform_content:
                platform_performance[platform.value] = {
                    "count": len(platform_content),
                    "total_views": sum(item.engagement_metrics.get("views", 0) for item in platform_content),
                    "avg_engagement": self._calculate_avg_engagement(platform_content)
                }
        
        # Content type breakdown
        type_performance = {}
        for content_type in ContentType:
            type_content = [item for item in recent_content if item.content_type == content_type]
            if type_content:
                type_performance[content_type.value] = {
                    "count": len(type_content),
                    "avg_engagement": self._calculate_avg_engagement(type_content)
                }
        
        return {
            "period_days": days,
            "total_content_posted": len(recent_content),
            "total_engagement": {
                "views": total_views,
                "likes": total_likes,
                "shares": total_shares,
                "comments": total_comments
            },
            "average_engagement_per_post": {
                "views": total_views / len(recent_content) if recent_content else 0,
                "likes": total_likes / len(recent_content) if recent_content else 0,
                "shares": total_shares / len(recent_content) if recent_content else 0,
                "comments": total_comments / len(recent_content) if recent_content else 0
            },
            "platform_performance": platform_performance,
            "content_type_performance": type_performance
        }
    
    def _calculate_avg_engagement(self, content_items: List[ContentItem]) -> float:
        """Calculate average engagement rate for content items"""
        if not content_items:
            return 0.0
        
        total_engagement = 0
        for item in content_items:
            views = item.engagement_metrics.get("views", 0)
            likes = item.engagement_metrics.get("likes", 0)
            shares = item.engagement_metrics.get("shares", 0)
            comments = item.engagement_metrics.get("comments", 0)
            
            if views > 0:
                engagement_rate = ((likes + shares + comments) / views) * 100
                total_engagement += engagement_rate
        
        return total_engagement / len(content_items) if content_items else 0.0
    
    def get_pipeline_status(self) -> Dict:
        """Get overall pipeline status and metrics"""
        status_counts = {}
        for status in ContentStatus:
            status_counts[status.value] = len(self.get_content_by_status(status))
        
        return {
            "total_content": len(self.content_items),
            "status_breakdown": status_counts,
            "content_by_platform": {
                platform.value: len(self.get_content_by_platform(platform))
                for platform in Platform
            },
            "character_consistency": self.check_character_consistency(),
            "scheduled_content": len(self.get_content_by_status(ContentStatus.SCHEDULED)),
            "pending_review": len(self.get_content_by_status(ContentStatus.REVIEW))
        }


def main():
    """Example usage of the Consort Content Pipeline system"""
    pipeline = ContentPipeline()
    
    print("=== Consort Depot - Content Pipeline ===")
    print()
    
    # Example: Add content item
    sample_content = ContentItem(
        id=f"content_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        title="Mac Character Reveal - Episode 1",
        content_type=ContentType.CHARACTER_REVEAL,
        platform=Platform.TIKTOK,
        character="Mac",
        status=ContentStatus.IDEA,
        description="First episode of Mac character reveal series"
    )
    
    if pipeline.add_content_item(sample_content):
        print(f"Added content: {sample_content.title}")
    print()
    
    # Generate 30-day calendar
    calendar = pipeline.generate_30_day_calendar()
    print("=== 30-Day Content Calendar ===")
    print(f"Generated calendar with {len(calendar)} days")
    print()
    
    # Check character consistency
    consistency = pipeline.check_character_consistency()
    print("=== Character Consistency ===")
    print(json.dumps(consistency, indent=2))
    print()
    
    # Pipeline status
    status = pipeline.get_pipeline_status()
    print("=== Pipeline Status ===")
    print(json.dumps(status, indent=2))


# Export main classes for module import
__all__ = [
    'ContentPipeline',
    'ContentItem',
    'ContentType',
    'Platform',
    'ContentStatus'
]


if __name__ == "__main__":
    main()