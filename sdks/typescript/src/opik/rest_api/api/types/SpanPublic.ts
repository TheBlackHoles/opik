/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as OpikApi from "../index";

export interface SpanPublic {
    id?: string;
    projectId?: string;
    traceId: string;
    parentSpanId?: string;
    name: string;
    type: OpikApi.SpanPublicType;
    startTime: Date;
    endTime?: Date;
    input?: OpikApi.JsonNodePublic;
    output?: OpikApi.JsonNodePublic;
    metadata?: OpikApi.JsonNodePublic;
    model?: string;
    provider?: string;
    tags?: string[];
    usage?: Record<string, number>;
    errorInfo?: OpikApi.ErrorInfoPublic;
    createdAt?: Date;
    lastUpdatedAt?: Date;
    createdBy?: string;
    lastUpdatedBy?: string;
    feedbackScores?: OpikApi.FeedbackScorePublic[];
    totalEstimatedCost?: number;
}
