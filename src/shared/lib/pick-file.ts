// Opens the browser file dialog and resolves with the chosen file, or null if the user cancels.
export function pickFile(accept: string[]): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept.join(',');
    input.multiple = false;

    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
    input.addEventListener('cancel', () => resolve(null), { once: true });

    input.click();
  });
}
