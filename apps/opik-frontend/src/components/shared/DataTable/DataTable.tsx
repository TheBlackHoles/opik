import React, { ReactNode, useEffect, useMemo } from "react";
import {
  Cell,
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  GroupingState,
  Row,
  RowData,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import isFunction from "lodash/isFunction";
import isEmpty from "lodash/isEmpty";
import isBoolean from "lodash/isBoolean";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import DataTableColumnResizer from "@/components/shared/DataTable/DataTableColumnResizer";
import {
  CELL_VERTICAL_ALIGNMENT,
  COLUMN_TYPE,
  OnChangeFn,
  ROW_HEIGHT,
} from "@/types/shared";
import { calculateHeightClass } from "@/components/shared/DataTable/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    rowHeight: ROW_HEIGHT;
    rowHeightClass: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface ColumnMeta<TData extends RowData, TValue> {
    type?: COLUMN_TYPE;
    header?: string;
    iconType?: COLUMN_TYPE;
    verticalAlignment?: CELL_VERTICAL_ALIGNMENT;
    custom?: object;
  }
}

interface ResizeConfig {
  enabled: boolean;
  onColumnResize?: (data: Record<string, number>) => void;
}

interface SelectionConfig {
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
}

interface GroupingConfig {
  groupedColumnMode: false | "reorder" | "remove";
  grouping: GroupingState;
  setGrouping?: OnChangeFn<GroupingState>;
}

interface ExpandingConfig {
  autoResetExpanded: boolean;
  expanded: ExpandedState;
  setExpanded: OnChangeFn<ExpandedState>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  renderCustomRow?: (row: Row<TData>) => ReactNode | null;
  getIsCustomRow?: (row: Row<TData>) => boolean;
  activeRowId?: string;
  resizeConfig?: ResizeConfig;
  selectionConfig?: SelectionConfig;
  groupingConfig?: GroupingConfig;
  expandingConfig?: ExpandingConfig;
  getRowId?: (row: TData) => string;
  getRowHeightClass?: (height: ROW_HEIGHT) => string;
  rowHeight?: ROW_HEIGHT;
  noData?: ReactNode;
  autoWidth?: boolean;
}

const DataTable = <TData, TValue>({
  columns,
  data,
  onRowClick,
  renderCustomRow,
  getIsCustomRow = () => false,
  activeRowId,
  resizeConfig,
  selectionConfig,
  groupingConfig,
  expandingConfig,
  getRowId,
  getRowHeightClass = calculateHeightClass,
  rowHeight = ROW_HEIGHT.small,
  noData,
  autoWidth = false,
}: DataTableProps<TData, TValue>) => {
  const isResizable = resizeConfig && resizeConfig.enabled;
  const isRowClickable = isFunction(onRowClick);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    columnResizeMode: "onChange",
    ...(isBoolean(groupingConfig?.groupedColumnMode) ||
    groupingConfig?.groupedColumnMode
      ? {
          groupedColumnMode: groupingConfig!.groupedColumnMode,
        }
      : {}),
    ...(isBoolean(expandingConfig?.autoResetExpanded)
      ? {
          autoResetExpanded: expandingConfig!.autoResetExpanded,
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    onRowSelectionChange: selectionConfig?.setRowSelection,
    onGroupingChange: groupingConfig?.setGrouping,
    onExpandedChange: expandingConfig?.setExpanded,
    state: {
      ...(selectionConfig?.rowSelection && {
        rowSelection: selectionConfig.rowSelection,
      }),
      ...(groupingConfig?.grouping && { grouping: groupingConfig.grouping }),
      ...(expandingConfig?.expanded && { expanded: expandingConfig.expanded }),
    },
    meta: {
      rowHeight,
      rowHeightClass: getRowHeightClass(rowHeight),
    },
  });

  const columnSizing = table.getState().columnSizing;
  const headers = table.getFlatHeaders();

  const columnSizeVars = useMemo(() => {
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [headers]);

  useEffect(() => {
    if (resizeConfig?.onColumnResize && !isEmpty(columnSizing)) {
      resizeConfig.onColumnResize(columnSizing);
    }
  }, [isResizable, resizeConfig, resizeConfig?.onColumnResize, columnSizing]);

  const tableStyles = useMemo(() => {
    return autoWidth
      ? {}
      : {
          ...columnSizeVars,
          minWidth: table.getTotalSize(),
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoWidth, columnSizeVars]);

  const renderRow = (row: Row<TData>) => {
    if (isFunction(renderCustomRow) && getIsCustomRow(row)) {
      return renderCustomRow(row);
    }

    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        {...(isRowClickable && !row.getIsGrouped()
          ? {
              onClick: () => onRowClick(row.original),
            }
          : {})}
        className={cn({
          "cursor-pointer": isRowClickable,
          "bg-muted/50": row.id === activeRowId,
        })}
      >
        {row.getVisibleCells().map((cell) => renderCell(row, cell))}
      </TableRow>
    );
  };

  const renderCell = (row: Row<TData>, cell: Cell<TData, unknown>) => {
    if (cell.getIsGrouped()) {
      return (
        <TableCell
          key={cell.id}
          data-cell-id={cell.id}
          colSpan={columns.length}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      );
    }

    if (cell.getIsAggregated()) {
      return null;
    }

    if (cell.getIsPlaceholder()) {
      return (
        <TableCell
          key={cell.id}
          data-cell-id={cell.id}
          style={{
            width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
            maxWidth: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          }}
        />
      );
    }

    return (
      <TableCell
        key={cell.id}
        data-cell-id={cell.id}
        style={{
          width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          maxWidth: `calc(var(--col-${cell.column.id}-size) * 1px)`,
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    );
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-md border">
      <Table style={tableStyles}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `calc(var(--header-${header?.id}-size) * 1px)`,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {isResizable ? (
                      <DataTableColumnResizer header={header} />
                    ) : null}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(renderRow)
          ) : (
            <TableRow data-testid="no-data-row">
              <TableCell colSpan={columns.length}>
                {noData ? (
                  noData
                ) : (
                  <div className="flex h-28 items-center justify-center text-muted-slate">
                    No results
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
