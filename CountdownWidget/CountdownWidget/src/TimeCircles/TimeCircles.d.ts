interface TimeCirclesTimeOptions {
    show?: boolean;
    text?: string;
    color?: string;
}

interface TimeCirclesTimes {
    Days?: TimeCirclesTimeOptions;
    Hours?: TimeCirclesTimeOptions;
    Minutes?: TimeCirclesTimeOptions;
    Seconds?: TimeCirclesTimeOptions;
}

interface TimeCirclesOptions {
    start?: boolean;
    animation?: "smooth" | "ticks";
    count_past_zero?: boolean;
    circle_bg_color?: string;
    use_background?: boolean;
    fg_width?: number;
    bg_width?: number;
    total_duration?: "Auto" | "Years" | "Months" | "Days" | "Hours" | "Minutes" | number;
    direction?: "Clockwise" | "Counter-clockwise" | "Both";
    start_angle?: number;
    time?: TimeCirclesTimes;
}

interface ITimeCircles {
    start(): ITimeCircles;
    stop(): ITimeCircles;
    restart(): ITimeCircles;
    destroy(): ITimeCircles;
    rebuild(): ITimeCircles;
    getTime(): number;
    addListener(callback: (unit: "Days" | "Hours" | "Minutes" | "Seconds", value: number, total: number) => void, type: "visible" | "all"): ITimeCircles;
    end(): JQuery;
}

interface JQuery {
    TimeCircles(options?: TimeCirclesOptions): ITimeCircles;
}