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
  assignments: Assignment[];
};

export type Assignment = {
  name: string;
  feedback: string | null;
  categories: {
    KU: Category | null;
    T: Category | null;
    C: Category | null;
    A: Category | null;
    O: Category | null;
  };
};

export interface Category {
  weight: number;
  scored: number;
  max: number;
}

export interface LoginTA {
  html: string;
};
