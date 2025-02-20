import { IInput } from '@/types';
import * as React from 'react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { InputStateHandler } from './InputStateHandler';

interface SelectItemType {
  label: string;
  icon?: React.ReactNode;
  notificationCount?: number;
  value: string | number;
}

interface SelectInputProps extends IInput {
  items?: SelectItemType[];
  value?: string | number;
  onChange: (value: string) => void;
  setField?: (field: string, value: string, shouldValidate?: boolean) => void;
  placeholder?: string;
}

const SelectInput = ({
  id,
  hasError,
  description,
  label,
  tooltip,
  disabled = false,
  items = [],
  value,
  onChange,
  setField,
  placeholder = 'Select',
  className
}: SelectInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <InputStateHandler
      id={id}
      hasError={hasError}
      description={description}
      label={label}
      tooltip={tooltip}
    >
      <Select
        disabled={disabled}
        value={value?.toString()}
        onValueChange={(v) => {
          onChange(v);
          setField?.(id, v);
        }}
      >
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-[200px]">
            {filteredItems.map((item) => (
              <SelectItem key={item.value} value={item.value.toString()}>
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                  {item.notificationCount && (
                    <span className="ml-auto bg-muted rounded-full px-2 py-0.5 text-xs">
                      {item.notificationCount}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </InputStateHandler>
  );
};

export { SelectInput };
export type { SelectItemType, SelectInputProps };
