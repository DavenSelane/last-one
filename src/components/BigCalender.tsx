"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import { calendarEvents } from "@/lib/data";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

interface BigCalendarProps {
  events?: any[];
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent?: (event: any) => void;
  onEventDrop?: (data: { event: any; start: Date; end: Date }) => void;
  onEventResize?: (data: { event: any; start: Date; end: Date }) => void;
  selectable?: boolean;
  editable?: boolean;
  views?: View[];
  defaultView?: View;
  eventPropGetter?: (event: any) => any;
  style?: React.CSSProperties;
  min?: Date;
  max?: Date;
}

const BigCalendar = ({
  events = calendarEvents,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  onEventResize,
  selectable = false,
  editable = false,
  views = ["work_week", "day"],
  defaultView = Views.WORK_WEEK,
  eventPropGetter,
  style = { height: "98%" },
  min = new Date(2025, 1, 0, 8, 0, 0),
  max = new Date(2025, 1, 0, 17, 0, 0),
}: BigCalendarProps) => {
  const [view, setView] = useState<View>(defaultView);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleEventDrop = (data: any) => {
    if (onEventDrop && editable) {
      onEventDrop({
        event: data.event,
        start: data.start,
        end: data.end,
      });
    }
  };

  const handleEventResize = (data: any) => {
    if (onEventResize && editable) {
      onEventResize({
        event: data.event,
        start: data.start,
        end: data.end,
      });
    }
  };

  if (editable) {
    return (
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event) => (event as CalendarEvent).start}
        endAccessor={(event) => (event as CalendarEvent).end}
        views={views}
        view={view}
        style={style}
        onView={handleOnChangeView}
        onSelectSlot={selectable ? onSelectSlot : undefined}
        onSelectEvent={onSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        selectable={selectable}
        resizable={true}
        draggableAccessor={() => true}
        eventPropGetter={eventPropGetter}
        min={min}
        max={max}
      />
    );
  }

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor={(event: CalendarEvent) => event.start}
      endAccessor={(event: CalendarEvent) => event.end}
      views={views}
      view={view}
      style={style}
      onView={handleOnChangeView}
      onSelectSlot={selectable ? onSelectSlot : undefined}
      onSelectEvent={onSelectEvent}
      selectable={selectable}
      eventPropGetter={eventPropGetter}
      min={min}
      max={max}
    />
  );
};

export default BigCalendar;
