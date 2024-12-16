# This file was auto-generated by Fern from our API Definition.

from ..core.pydantic_utilities import UniversalBaseModel
import typing
import pydantic
import datetime as dt
from .json_node_write import JsonNodeWrite
from .error_info_write import ErrorInfoWrite
from ..core.pydantic_utilities import IS_PYDANTIC_V2


class TraceWrite(UniversalBaseModel):
    id: typing.Optional[str] = None
    project_name: typing.Optional[str] = pydantic.Field(default=None)
    """
    If null, the default project is used
    """

    name: str
    start_time: dt.datetime
    end_time: typing.Optional[dt.datetime] = None
    input: typing.Optional[JsonNodeWrite] = None
    output: typing.Optional[JsonNodeWrite] = None
    metadata: typing.Optional[JsonNodeWrite] = None
    tags: typing.Optional[typing.List[str]] = None
    error_info: typing.Optional[ErrorInfoWrite] = None

    if IS_PYDANTIC_V2:
        model_config: typing.ClassVar[pydantic.ConfigDict] = pydantic.ConfigDict(
            extra="allow", frozen=True
        )  # type: ignore # Pydantic v2
    else:

        class Config:
            frozen = True
            smart_union = True
            extra = pydantic.Extra.allow
