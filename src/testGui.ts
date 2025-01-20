const uiId = 'testUi';

export type TestGUIProps = {
    fps: number;
};

export const testGUI = () => {
    return ({ fps }: TestGUIProps) => {
        if (!document.getElementById(uiId)) {
            const el = document.createElement('div');
            el.id = uiId;
            document.body.appendChild(el);
        }

        const uiElement = document.getElementById(uiId);

        if (!uiElement) return;

        uiElement.innerHTML = `<span>${Math.round(fps)}</span>`;
    };
};
