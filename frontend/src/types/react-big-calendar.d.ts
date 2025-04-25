/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react-big-calendar" {
  import { ComponentType } from "react";
  import { DateLocalizer } from "react-big-calendar";
  import "react-big-calendar/lib/sass/styles"; // ← こっち！

  export const momentLocalizer: (
    momentInstance: typeof moment
  ) => DateLocalizer;

  export interface Event {
    [key: string]: any;
  }

  export interface CalendarProps<T extends object = Event> {
    localizer: any;
    events: T[];
    startAccessor: string | ((event: T) => Date);
    endAccessor: string | ((event: T) => Date);
    titleAccessor: string | ((event: T) => string);
    views?: any;
    selectable?: boolean;
    messages?: Record<string, string>;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function momentLocalizer(momentInstance: any): any;
}
