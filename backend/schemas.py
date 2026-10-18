from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class SourceDocumentInput(BaseModel):
    label: str
    source_role: str
    raw_text: str
