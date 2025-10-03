"use client";

import BigCalendar from "./BigCalender";

interface ProfileCalendarProps {
  events: any[];
}

const ProfileCalendar = ({ events }: ProfileCalendarProps) => {
  const eventStyleGetter = (event: any) => ({
    style: {
      backgroundColor: event.color || '#3b82f6',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    },
  });

  return (
    <BigCalendar
      events={events}
      eventPropGetter={eventStyleGetter}
    />
  );
};

export default ProfileCalendar;
