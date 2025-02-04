const uiId = 'testUi';

export type TestGUIProps = {
    fps: number;
    rpm: number;
    speed: number;
    gear: number;
};

export const testGUI = () => {
    return ({ fps, rpm, gear, speed }: TestGUIProps) => {
        if (!document.getElementById(uiId)) {
            const el = document.createElement('div');
            el.id = uiId;
            document.body.appendChild(el);
        }

        const uiElement = document.getElementById(uiId);

        if (!uiElement) return;

        uiElement.innerHTML = `
        <span>FPS:${Math.round(fps)}</span>
        <span>RPM:${Math.round(rpm)}</span>
        <span>SPD:${Math.round(speed)}</span>
        <span>GEAR:${gear}</span>
        `;
    };
};
