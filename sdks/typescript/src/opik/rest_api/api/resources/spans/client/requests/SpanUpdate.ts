/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as OpikApi from "../../../../index";

/**
 * @example
 *     {
 *         traceId: "trace_id"
 *     }
 */
export interface SpanUpdate {
    /** If null and project_id not specified, Default Project is assumed */
    projectName?: string;
    /** If null and project_name not specified, Default Project is assumed */
    projectId?: string;
    traceId: string;
    parentSpanId?: string;
    endTime?: Date;
    input?: OpikApi.JsonNode;
    output?: OpikApi.JsonNode;
    metadata?: OpikApi.JsonNode;
    model?: string;
    provider?: string;
    tags?: string[];
    usage?: Record<string, number>;
    errorInfo?: OpikApi.ErrorInfo;
}
