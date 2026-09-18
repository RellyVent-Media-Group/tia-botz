#!/usr/bin/env python3
"""
Scribe Depot Document Management Automation
Automates document management, contract automation, and infrastructure monitoring
"""

import json
import datetime
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class DocumentType(Enum):
    CONTRACT = "contract"
    REPORT = "report"
    MANUAL = "manual"
    GUIDELINE = "guideline"
    INFRASTRUCTURE = "infrastructure"
    ESTATE = "estate"


class DocumentStatus(Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    ARCHIVED = "archived"
    SUPERSEDED = "superseded"


@dataclass
class Document:
    """Document record"""
    document_id: str
    document_type: DocumentType
    title: str
    description: str
    content: str
    status: DocumentStatus
    author: str
    reviewer: str
    created_at: str
    updated_at: str
    version: str
    tags: List[str]
    related_documents: List[str]
    metadata: Dict


@dataclass
class Contract:
    """Contract management"""
    contract_id: str
    contract_type: str
    parties: List[str]
    terms: Dict
    status: str
    start_date: str
    end_date: str
    value: float
    document_id: str
    auto_renewal: bool
    notifications: List[str]


class DocumentManager:
    """Main document management system"""
    
    def __init__(self, data_path: str = "scribe_document_data.json"):
        self.data_path = data_path
        self.documents: Dict[str, Document] = {}
        self.contracts: Dict[str, Contract] = {}
        self.document_templates = {
            DocumentType.CONTRACT: self._get_contract_template(),
            DocumentType.REPORT: self._get_report_template(),
            DocumentType.MANUAL: self._get_manual_template(),
            DocumentType.GUIDELINE: self._get_guideline_template()
        }
        self.load_data()
    
    def load_data(self):
        """Load document data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                
                # Load documents
                for doc_id, doc_data in data.get("documents", {}).items():
                    self.documents[doc_id] = Document(
                        document_id=doc_data["document_id"],
                        document_type=DocumentType(doc_data["document_type"]),
                        title=doc_data["title"],
                        description=doc_data["description"],
                        content=doc_data["content"],
                        status=DocumentStatus(doc_data["status"]),
                        author=doc_data["author"],
                        reviewer=doc_data["reviewer"],
                        created_at=doc_data["created_at"],
                        updated_at=doc_data["updated_at"],
                        version=doc_data["version"],
                        tags=doc_data["tags"],
                        related_documents=doc_data["related_documents"],
                        metadata=doc_data.get("metadata", {})
                    )
                
                # Load contracts
                for contract_id, contract_data in data.get("contracts", {}).items():
                    self.contracts[contract_id] = Contract(
                        contract_id=contract_data["contract_id"],
                        contract_type=contract_data["contract_type"],
                        parties=contract_data["parties"],
                        terms=contract_data["terms"],
                        status=contract_data["status"],
                        start_date=contract_data["start_date"],
                        end_date=contract_data["end_date"],
                        value=contract_data["value"],
                        document_id=contract_data["document_id"],
                        auto_renewal=contract_data["auto_renewal"],
                        notifications=contract_data["notifications"]
                    )
        except FileNotFoundError:
            self._initialize_default_documents()
    
    def save_data(self):
        """Save document data to file"""
        data = {
            "documents": {},
            "contracts": {}
        }
        
        for doc_id, doc in self.documents.items():
            data["documents"][doc_id] = {
                "document_id": doc.document_id,
                "document_type": doc.document_type.value,
                "title": doc.title,
                "description": doc.description,
                "content": doc.content,
                "status": doc.status.value,
                "author": doc.author,
                "reviewer": doc.reviewer,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at,
                "version": doc.version,
                "tags": doc.tags,
                "related_documents": doc.related_documents,
                "metadata": doc.metadata
            }
        
        for contract_id, contract in self.contracts.items():
            data["contracts"][contract_id] = {
                "contract_id": contract.contract_id,
                "contract_type": contract.contract_type,
                "parties": contract.parties,
                "terms": contract.terms,
                "status": contract.status,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "value": contract.value,
                "document_id": contract.document_id,
                "auto_renewal": contract.auto_renewal,
                "notifications": contract.notifications
            }
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def _initialize_default_documents(self):
        """Initialize default documents"""
        default_docs = [
            {
                "document_type": DocumentType.MANUAL,
                "title": "Scribe Depot Operations Manual",
                "description": "Comprehensive operations manual for Scribe Depot",
                "author": "System",
                "reviewer": "ZI",
                "tags": ["operations", "manual", "depot"]
            },
            {
                "document_type": DocumentType.GUIDELINE,
                "title": "Document Management Guidelines",
                "description": "Guidelines for document creation and management",
                "author": "System",
                "reviewer": "Scribe of Canvassing",
                "tags": ["guidelines", "documentation", "process"]
            }
        ]
        
        for doc_config in default_docs:
            template = self.document_templates.get(doc_config["document_type"], "")
            doc_id = f"{doc_config['document_type'].value}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            document = Document(
                document_id=doc_id,
                document_type=doc_config["document_type"],
                title=doc_config["title"],
                description=doc_config["description"],
                content=template,
                status=DocumentStatus.DRAFT,
                author=doc_config["author"],
                reviewer=doc_config["reviewer"],
                created_at=datetime.datetime.now().isoformat(),
                updated_at=datetime.datetime.now().isoformat(),
                version="1.0",
                tags=doc_config["tags"],
                related_documents=[],
                metadata={}
            )
            
            self.documents[doc_id] = document
        
        self.save_data()
    
    def create_document(self, document_type: DocumentType, title: str, 
                       description: str, author: str, reviewer: str,
                       content: str = None, tags: List[str] = None) -> str:
        """Create a new document"""
        doc_id = f"{document_type.value}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if content is None:
            content = self.document_templates.get(document_type, "")
        
        document = Document(
            document_id=doc_id,
            document_type=document_type,
            title=title,
            description=description,
            content=content,
            status=DocumentStatus.DRAFT,
            author=author,
            reviewer=reviewer,
            created_at=datetime.datetime.now().isoformat(),
            updated_at=datetime.datetime.now().isoformat(),
            version="1.0",
            tags=tags or [],
            related_documents=[],
            metadata={}
        )
        
        self.documents[doc_id] = document
        self.save_data()
        return doc_id
    
    def update_document(self, document_id: str, **kwargs) -> bool:
        """Update an existing document"""
        if document_id not in self.documents:
            return False
        
        document = self.documents[document_id]
        
        for key, value in kwargs.items():
            if hasattr(document, key):
                setattr(document, key, value)
        
        # Update version and timestamp
        document.version = self._increment_version(document.version)
        document.updated_at = datetime.datetime.now().isoformat()
        
        self.save_data()
        return True
    
    def approve_document(self, document_id: str, reviewer: str) -> bool:
        """Approve a document"""
        if document_id not in self.documents:
            return False
        
        self.documents[document_id].status = DocumentStatus.APPROVED
        self.documents[document_id].reviewer = reviewer
        self.documents[document_id].updated_at = datetime.datetime.now().isoformat()
        self.save_data()
        return True
    
    def archive_document(self, document_id: str) -> bool:
        """Archive a document"""
        if document_id not in self.documents:
            return False
        
        self.documents[document_id].status = DocumentStatus.ARCHIVED
        self.documents[document_id].updated_at = datetime.datetime.now().isoformat()
        self.save_data()
        return True
    
    def get_documents_by_type(self, document_type: DocumentType) -> List[Document]:
        """Get all documents of a specific type"""
        return [doc for doc in self.documents.values() if doc.document_type == document_type]
    
    def get_documents_by_status(self, status: DocumentStatus) -> List[Document]:
        """Get all documents with a specific status"""
        return [doc for doc in self.documents.values() if doc.status == status]
    
    def search_documents(self, query: str) -> List[Document]:
        """Search documents by title, description, or tags"""
        query_lower = query.lower()
        results = []
        
        for doc in self.documents.values():
            if (query_lower in doc.title.lower() or 
                query_lower in doc.description.lower() or
                any(query_lower in tag.lower() for tag in doc.tags)):
                results.append(doc)
        
        return results
    
    def create_contract(self, contract_type: str, parties: List[str], 
                      terms: Dict, start_date: str, end_date: str,
                      value: float, auto_renewal: bool = False) -> str:
        """Create a new contract"""
        contract_id = f"CONTRACT_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create associated document
        doc_id = self.create_document(
            document_type=DocumentType.CONTRACT,
            title=f"{contract_type} Contract",
            description=f"Contract for {contract_type}",
            author="System",
            reviewer="Scribe of Contracts",
            tags=["contract", contract_type.lower()]
        )
        
        contract = Contract(
            contract_id=contract_id,
            contract_type=contract_type,
            parties=parties,
            terms=terms,
            status="active",
            start_date=start_date,
            end_date=end_date,
            value=value,
            document_id=doc_id,
            auto_renewal=auto_renewal,
            notifications=[]
        )
        
        self.contracts[contract_id] = contract
        self.save_data()
        return contract_id
    
    def get_expiring_contracts(self, days: int = 30) -> List[Contract]:
        """Get contracts expiring within specified days"""
        today = datetime.date.today()
        threshold = today + datetime.timedelta(days=days)
        
        expiring = []
        for contract in self.contracts.values():
            end_date = datetime.datetime.strptime(contract.end_date, "%Y-%m-%d").date()
            if today <= end_date <= threshold:
                expiring.append(contract)
        
        return sorted(expiring, key=lambda x: x.end_date)
    
    def generate_document_report(self) -> str:
        """Generate comprehensive document report"""
        report = []
        report.append("=" * 80)
        report.append("SCRIBE DEPOT DOCUMENT MANAGEMENT REPORT")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        # Document summary
        report.append("DOCUMENT SUMMARY:")
        report.append(f"  Total Documents: {len(self.documents)}")
        
        for doc_type in DocumentType:
            type_docs = self.get_documents_by_type(doc_type)
            if type_docs:
                report.append(f"  {doc_type.value.capitalize()}: {len(type_docs)}")
        
        report.append("")
        
        # Status breakdown
        report.append("DOCUMENT STATUS BREAKDOWN:")
        for status in DocumentStatus:
            status_docs = self.get_documents_by_status(status)
            if status_docs:
                report.append(f"  {status.value.capitalize()}: {len(status_docs)}")
        
        report.append("")
        
        # Pending reviews
        pending_review = self.get_documents_by_status(DocumentStatus.REVIEW)
        if pending_review:
            report.append(f"PENDING REVIEWS ({len(pending_review)}):")
            for doc in pending_review:
                report.append(f"  • {doc.title} (Reviewer: {doc.reviewer})")
            report.append("")
        
        # Contract summary
        report.append("CONTRACT SUMMARY:")
        report.append(f"  Total Contracts: {len(self.contracts)}")
        
        active_contracts = [c for c in self.contracts.values() if c.status == "active"]
        report.append(f"  Active Contracts: {len(active_contracts)}")
        
        if active_contracts:
            total_value = sum(c.value for c in active_contracts)
            report.append(f"  Total Contract Value: ${total_value:,.2f}")
        
        report.append("")
        
        # Expiring contracts
        expiring = self.get_expiring_contracts(30)
        if expiring:
            report.append(f"CONTRACTS EXPIRING WITHIN 30 DAYS ({len(expiring)}):")
            for contract in expiring:
                report.append(f"  • {contract.contract_type} - Expires: {contract.end_date}")
                report.append(f"    Parties: {', '.join(contract.parties)}")
                report.append(f"    Value: ${contract.value:,.2f}")
            report.append("")
        
        return "\n".join(report)
    
    def _increment_version(self, version: str) -> str:
        """Increment document version"""
        try:
            major, minor = version.split(".")
            return f"{major}.{int(minor) + 1}"
        except:
            return "2.0"
    
    def _get_contract_template(self) -> str:
        """Get contract document template"""
        return """
# CONTRACT AGREEMENT

## Parties
This agreement is made between the parties listed below.

## Terms and Conditions
[Contract terms will be populated here]

## Duration
Start Date: [Start Date]
End Date: [End Date]

## Compensation
Total Value: $[Value]

## Signatures
[Signature section]
"""
    
    def _get_report_template(self) -> str:
        """Get report document template"""
        return """
# REPORT

## Executive Summary
[Report summary]

## Methodology
[Methodology description]

## Findings
[Report findings]

## Recommendations
[Recommendations]

## Conclusion
[Report conclusion]
"""
    
    def _get_manual_template(self) -> str:
        """Get manual document template"""
        return """
# OPERATIONS MANUAL

## Purpose
[Manual purpose]

## Scope
[Manual scope]

## Procedures
[Operational procedures]

## Guidelines
[Operational guidelines]

## Emergency Procedures
[Emergency procedures]

## Appendices
[Additional information]
"""
    
    def _get_guideline_template(self) -> str:
        """Get guideline document template"""
        return """
# GUIDELINES

## Overview
[Guideline overview]

## Principles
[Guiding principles]

## Standards
[Operational standards]

## Best Practices
[Best practices]

## Compliance
[Compliance requirements]

## References
[Additional references]
"""


def main():
    """Main function for testing and demonstration"""
    manager = DocumentManager()
    
    # Create sample documents
    doc_id = manager.create_document(
        document_type=DocumentType.REPORT,
        title="Q1 2024 Infrastructure Performance Report",
        description="Quarterly report on infrastructure performance",
        author="Scribe of Infrastructure",
        reviewer="ZI",
        tags=["infrastructure", "report", "Q1", "2024"]
    )
    
    # Approve document
    manager.approve_document(doc_id, "ZI")
    
    # Create sample contract
    contract_id = manager.create_contract(
        contract_type="Service Agreement",
        parties=["TZI Systems", "External Provider"],
        terms={"service_level": "99.9%", "response_time": "4 hours"},
        start_date="2024-09-01",
        end_date="2025-09-01",
        value=50000.00,
        auto_renewal=True
    )
    
    # Generate report
    print(manager.generate_document_report())


if __name__ == "__main__":
    main()