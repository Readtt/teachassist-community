export type Course = {
  code: string;
  name: string | null;
  block: number;
  room: string;
  times: {
    startTime: Date;
    endTime: Date;
    droppedTime: Date | null;
  };
  overallMark: number | null;
  isFinal: boolean;
  isMidterm: boolean;
  link: string | null;
  schoolIdentifier: string;
};

export interface Category {
  weight: number;
  scored: number;
  max: number;
}

export interface LoginTA {
  html: string;
};
