/**
 * Queue filter bar (priority, assignee, org, date range). Search also reads ?q=.
 */
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import CustomDateRangeFields from "@/components/feature/CustomDateRangeFields";
import {
  queuePriorityOptions,
  queueDateOptions,
} from "@/mocks/consoleQueue";
import { CUSTOM_RANGE, type DateRangeValue } from "@/utils/date";

interface QueueFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  project: string;
  projectOptions: string[];
  onProject: (value: string) => void;
  priority: string;
  onPriority: (value: string) => void;
  assignee: string;
  assigneeOptions: string[];
  onAssignee: (value: string) => void;
  dateRange: DateRangeValue;
  onDateRange: (value: DateRangeValue) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function QueueFilters({
  search,
  onSearch,
  project,
  projectOptions,
  onProject,
  priority,
  onPriority,
  assignee,
  assigneeOptions,
  onAssignee,
  dateRange,
  onDateRange,
  onClear,
  hasActiveFilters,
}: QueueFiltersProps) {
  return (
    <div className="border-b border-background-200 px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-foreground-400 text-[16px] leading-none"></i>
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by ticket ID, request, project or assignee…"
            className="h-10 w-full rounded-md border border-background-300 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:flex lg:items-center">
          <Select
            options={projectOptions}
            value={project}
            onChange={(event) => onProject(event.target.value)}
            icon="ri-folders-line"
            containerClassName="lg:w-[178px]"
          />
          <Select
            options={queuePriorityOptions}
            value={priority}
            onChange={(event) => onPriority(event.target.value)}
            icon="ri-flag-line"
            containerClassName="lg:w-[150px]"
          />
          <Select
            options={assigneeOptions}
            value={assignee}
            onChange={(event) => onAssignee(event.target.value)}
            icon="ri-user-line"
            containerClassName="lg:w-[160px]"
          />
          <Select
            options={queueDateOptions}
            value={dateRange.preset}
            onChange={(event) => onDateRange({ ...dateRange, preset: event.target.value })}
            icon="ri-calendar-line"
            containerClassName="lg:w-[150px]"
          />
        </div>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" icon="ri-close-line" onClick={onClear} className="lg:ml-1">
            Clear
          </Button>
        ) : null}
      </div>

      {dateRange.preset === CUSTOM_RANGE ? (
        <CustomDateRangeFields
          className="mt-3 rounded-lg border border-background-200 bg-background-100 px-3 py-2.5"
          from={dateRange.from}
          to={dateRange.to}
          onFrom={(value) => onDateRange({ ...dateRange, from: value })}
          onTo={(value) => onDateRange({ ...dateRange, to: value })}
        />
      ) : null}
    </div>
  );
}