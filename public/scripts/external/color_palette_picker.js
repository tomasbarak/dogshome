class PalettePicker {
    constructor(color_array) {
        this.color_array = color_array;
    }

    show() {
        this.create_palette_picker("Seleccioná un color");
    }

    hide() {
        const background = document.querySelector('.palette-picker-background');
        background.remove();
    }

    create_palette_picker(title) {
        console.log("Creating palette picker");
        const background = document.createElement('div');
        background.classList.add('palette-picker-background');
        background.addEventListener('click', () => {
            console.log("Background clicked");
            this.hide();
        })

        console.log(background);

        const palette_picker = document.createElement('div');
        palette_picker.classList.add('palette-picker');
        palette_picker.addEventListener('click', (e) => { e.stopPropagation(); });
        background.appendChild(palette_picker);

        const palette_picker_header = document.createElement('div');
        palette_picker_header.classList.add('palette-picker-header');
        palette_picker.appendChild(palette_picker_header);

        const palette_picker_header_title = document.createElement('div');
        palette_picker_header_title.classList.add('palette-picker-header-title');
        palette_picker_header_title.innerHTML = title || 'Palette Picker';
        palette_picker_header.appendChild(palette_picker_header_title);

        const palette_picker_header_close = document.createElement('div');
        palette_picker_header_close.classList.add('palette-picker-header-close');
        palette_picker_header_close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>';
        palette_picker_header_close.addEventListener('click', () => {
            console.log("Close btn clicked");
            this.hide();
        })
        palette_picker_header.appendChild(palette_picker_header_close);

        const palette_picker_body = document.createElement('div');
        palette_picker_body.classList.add('palette-picker-body');
        palette_picker.appendChild(palette_picker_body);

        this.color_array.forEach((color_str) => {
            const palette_picker_color_box = document.createElement('div');
            palette_picker_color_box.classList.add('palette-picker-color-box');
            palette_picker_color_box.style.backgroundColor = color_str;
            palette_picker_body.appendChild(palette_picker_color_box);
        });

        const doc_body = document.querySelector('body');
        doc_body.appendChild(background);

    }

}