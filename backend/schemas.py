from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CreateCaseRequest(BaseModel):
    title: str
    domain: str
