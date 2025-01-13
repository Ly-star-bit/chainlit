import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { IDataframeElement } from '@chainlit/react-client';

import Alert from '@/components/Alert';
import { Loader } from '@/components/Loader';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { useFetch } from 'hooks/useFetch';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface DataframeData {
  index: (string | number)[];
  columns: string[];
  data: (string | number)[][];
}

const _DataframeElement = ({ data }: { data: DataframeData }) => {
  const { index, columns, data: rowData } = data;

  const tableColumns: ColumnDef<Record<string, string | number>>[] = useMemo(
    () =>
      columns.map((col: string) => ({
        accessorKey: col,
        header: ({ column }) => {
          const sort = column.getIsSorted();
          return (
            <div
              className="flex items-center cursor-pointer"
              onClick={() => column.toggleSorting()}
            >
              {col}
              {sort === 'asc' && <ArrowUp className="ml-2 !size-3" />}
              {sort === 'desc' && <ArrowDown className="ml-2 !size-3" />}
            </div>
          );
        }
      })),
    [columns]
  );

  const tableRows = useMemo(
    () =>
      rowData.map((row, idx) => {
        const rowObj: Record<string, string | number> = { id: index[idx] };
        columns.forEach((col, colIdx) => {
          rowObj[col] = row[colIdx];
        });
        return rowObj;
      }),
    [rowData, columns, index]
  );

  const table = useReactTable({
    data: tableRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  const renderPaginationItems = useCallback(() => {
    const totalPages = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const pagesToShow = 4;
    const halfPages = Math.floor(pagesToShow / 2);

    let startPage = Math.max(0, currentPage - halfPages);
    let endPage = Math.min(totalPages - 1, currentPage + halfPages);

    // 如果当前页靠近开头
    if (currentPage < halfPages) {
      endPage = Math.min(pagesToShow - 1, totalPages - 1);
    }
    // 如果当前页靠近结尾
    if (currentPage > totalPages - halfPages - 1) {
      startPage = Math.max(0, totalPages - pagesToShow);
    }

    const items = [];
    // 添加每页条数选择器
    items.push(
      <PaginationItem key="page-size">
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm bg-background hover:bg-muted transition-colors"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              每页 {size} 条
            </option>
          ))}
        </select>
      </PaginationItem>
    );

    // 添加总页数显示
    items.push(
      <PaginationItem key="total-pages">
        <span className="px-2 text-sm">共 {totalPages} 页</span>
      </PaginationItem>
    );

    // 添加页码导航
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => table.setPageIndex(i)}
            isActive={currentPage === i}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }, [
    table.getPageCount(),
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize
  ]);

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto dataframe">
      <div className="rounded-md border overflow-y-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const cellValue = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    );
                    return (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap overflow-hidden max-w-[200px]"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">{cellValue}</div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[400px] bg-background p-2 border rounded text-xs text-muted-foreground break-words whitespace-pre-wrap">
                            <div className="flex justify-between items-center gap-2">
                              <div className="max-h-[100px] overflow-y-auto">
                                {cellValue}
                              </div>
                              <button
                                className="p-1 hover:bg-muted rounded"
                                onClick={(e) => {
                                  const text =
                                    typeof cellValue === 'object' &&
                                    cellValue !== null
                                      ? (
                                          cellValue as React.ReactElement
                                        )?.props?.getValue() || ''
                                      : '';
                                  navigator.clipboard.writeText(text || '');
                                  toast.success('复制成功');
                                  e.stopPropagation();
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent className="ml-auto">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={
                !table.getCanPreviousPage()
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={
                !table.getCanNextPage()
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

function DataframeElement({ element }: { element: IDataframeElement }) {
  const { data, isLoading, error } = useFetch(element.url || null);

  const jsonData = useMemo(() => {
    if (data) return JSON.parse(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error.message}</Alert>;
  }

  return <_DataframeElement data={jsonData} />;
}

export default DataframeElement;
