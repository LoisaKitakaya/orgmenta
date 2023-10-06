import React, {
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  Column,
  Table,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  sortingFns,
  getSortedRowModel,
  FilterFn,
  SortingFn,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";

import { faker } from "@faker-js/faker";

import { UtilityPlatformMain } from "./platform";
import { View, Text, TextInput, FlatList, Pressable } from "react-native";

// fake data to use in our table view

export type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: "relationship" | "complicated" | "single";
  subRows?: Person[];
};

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (): Person => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    status: faker.helpers.shuffle<Person["status"]>([
      "relationship",
      "complicated",
      "single",
    ])[0]!,
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((d): Person => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

declare module "@tanstack/table-core" {
  export interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }

  export interface FilterMeta {
    itemRank: RankingInfo;
  }
}

// Define fuzzy filter and sorting functions

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

// A debounced input react component

export const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  if (UtilityPlatformMain.OS === "web") {
    return (
      <input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  } else {
    return (
      <TextInput
        {...props}
        value={value.toString()} // Convert to string for TextInput value
        onChangeText={(text) => setValue(text)} // Use onChangeText instead of onChange
      />
    );
  }
};

export const Filter = ({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  if (UtilityPlatformMain.OS === "web") {
    return typeof firstValue === "number" ? (
      <div>
        <div className="flex space-x-2">
          <DebouncedInput
            type="number"
            min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
            max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder={`Min ${
              column.getFacetedMinMaxValues()?.[0]
                ? `(${column.getFacetedMinMaxValues()?.[0]})`
                : ""
            }`}
            className="w-24 border shadow rounded"
          />
          <DebouncedInput
            type="number"
            min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
            max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
            placeholder={`Max ${
              column.getFacetedMinMaxValues()?.[1]
                ? `(${column.getFacetedMinMaxValues()?.[1]})`
                : ""
            }`}
            className="w-24 border shadow rounded"
          />
        </div>
        <div className="h-1" />
      </div>
    ) : (
      <>
        <datalist id={column.id + "list"}>
          {sortedUniqueValues.slice(0, 5000).map((value: any) => (
            <option value={value} key={value} />
          ))}
        </datalist>
        <DebouncedInput
          type="text"
          value={(columnFilterValue ?? "") as string}
          onChange={(value) => column.setFilterValue(value)}
          placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
          className="w-36 border shadow rounded"
          list={column.id + "list"}
        />
        <div className="h-1" />
      </>
    );
  } else {
    return typeof firstValue === "number" ? (
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <DebouncedInput
            type="numeric" // Set type for numeric input
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder={`Min ${
              column.getFacetedMinMaxValues()?.[0]
                ? `(${column.getFacetedMinMaxValues()?.[0]})`
                : ""
            }`}
            style={{ width: 80, borderWidth: 1, borderRadius: 5, padding: 5 }}
          />
          <DebouncedInput
            type="numeric" // Set type for numeric input
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
            placeholder={`Max ${
              column.getFacetedMinMaxValues()?.[1]
                ? `(${column.getFacetedMinMaxValues()?.[1]})`
                : ""
            }`}
            style={{ width: 80, borderWidth: 1, borderRadius: 5, padding: 5 }}
          />
        </View>
        <View style={{ height: 1 }} />
      </View>
    ) : (
      <>
        <TextInput
          value={(columnFilterValue ?? "") as string}
          onChangeText={(text) => column.setFilterValue(text)} // Use onChangeText for text input
          placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
          style={{ width: 120, borderWidth: 1, borderRadius: 5, padding: 5 }}
          // list={column.id + "list"} // React Native doesn't have datalist, so you may need a custom solution
        />
        <View style={{ height: 1 }} />
      </>
    );
  }
};

const TableViewWeb = (props: any) => {
  const { columns, data, refreshData } = props;

  const rerender = useReducer(() => ({}), {})[1];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === "fullName") {
      if (table.getState().sorting[0]?.id !== "fullName") {
        table.setSorting([{ id: "fullName", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <div className="p-2">
      <div>
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </div>
      <div className="h-2" />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} table={table} />
                          </div>
                        ) : null}
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      {/* <pre>{JSON.stringify(table.getState(), null, 2)}</pre> */}
    </div>
  );
};

const TableViewMobile = (props: any) => {
  const { columns, data, refreshData } = props;

  const rerender = useReducer(() => ({}), {})[1];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === "fullName") {
      if (table.getState().sorting[0]?.id !== "fullName") {
        table.setSorting([{ id: "fullName", desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  return (
    <View style={{ padding: 2 }}>
      <View>
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          style={{
            padding: 2,
            fontSize: 18,
            borderWidth: 1,
            borderColor: "black",
          }}
          placeholder="Search all columns..."
        />
      </View>
      <View style={{ height: 2 }} />
      {/* Use FlatList to render your table */}
      <FlatList
        data={table.getRowModel().rows}
        keyExtractor={(row) => row.id.toString()}
        renderItem={({ item: row }) => (
          <View key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Text key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Text>
            ))}
          </View>
        )}
      />
      <View style={{ height: 2 }} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          style={({ pressed }) => ({
            borderColor: pressed ? "gray" : "black",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          })}
          onPress={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <Text>{"<<"}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({
            borderColor: pressed ? "gray" : "black",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          })}
          onPress={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <Text>{"<"}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({
            borderColor: pressed ? "gray" : "black",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          })}
          onPress={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <Text>{">"}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({
            borderColor: pressed ? "gray" : "black",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
          })}
          onPress={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <Text>{">>"}</Text>
        </Pressable>
        <Text>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} |
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text> Go to page:</Text>
          <TextInput
            value={(table.getState().pagination.pageIndex + 1).toString()}
            onChangeText={(text) => {
              const page = text ? Number(text) - 1 : 0;
              table.setPageIndex(page);
            }}
            style={{ borderWidth: 1, borderRadius: 5, padding: 5, width: 50 }}
          />
        </View>
        <TextInput
          value={table.getState().pagination.pageSize.toString()}
          onChangeText={(text) => {
            table.setPageSize(Number(text));
          }}
          style={{ borderWidth: 1, borderRadius: 5, padding: 5, width: 80 }}
        />
      </View>
      <Text>{table.getPrePaginationRowModel().rows.length} Rows</Text>
      <Pressable
        style={({ pressed }) => ({
          borderColor: pressed ? "gray" : "black",
          borderWidth: 1,
          borderRadius: 5,
          padding: 5,
        })}
        onPress={() => rerender()}
      >
        <Text>Force Rerender</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => ({
          borderColor: pressed ? "gray" : "black",
          borderWidth: 1,
          borderRadius: 5,
          padding: 5,
        })}
        onPress={() => refreshData()}
      >
        <Text>Refresh Data</Text>
      </Pressable>
    </View>
  );
};

export const UseDisplayTable =
  UtilityPlatformMain.OS === "web"
    ? ({ tableData }: any) => {
        return <TableViewWeb {...tableData} />;
      }
    : ({ tableData }: any) => {
        return <TableViewMobile {...tableData} />;
      };