declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': {
            src?: string;
            alt?: string;
            autoplay?: boolean;
            'auto-rotate'?: boolean;
            'camera-controls'?: boolean;
            'shadow-intensity'?: string;
            'environment-image'?: string;
            'exposure'?: string;
            'interaction-prompt'?: string;
            ar?: boolean;
            'ar-modes'?: string;
            style?: React.CSSProperties;
            className?: string;
            [key: string]: unknown;
        };
    }
}
