const { dir } = require("console");
const fs = require("fs");
const path = require("path");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")));

const fa_class_0 = config.icon_sharp ? "fa-sharp" : "";
const fa_class_1 = config.icon_solid ? "fa-solid" : "fa-regular";
const make_fa_icon_class = function(icon) {
    return fa_class_0 + " " + fa_class_1 + " fa-" + icon;
};

const error_icon = make_fa_icon_class(config.error_icon);
const directory_icon_default = make_fa_icon_class(config.directory_icon_default);
const directory_icon_parent = make_fa_icon_class(config.directory_icon_parent);
const file_icon_default = make_fa_icon_class(config.file_icon_default);

const make_file_icon_class = function(filep) {
    if(filep.ext in config.file_icons)
        return make_fa_icon_class(config.file_icons[filep.ext]);
    return file_icon_default;
};

const make_readable_size = function(size) {
    const units = [ "B", "KiB", "MiB" ];
    let value = Math.ceil(size);
    let unit = 0;
    while(value > 1024) {
        value /= 1024;
        unit++;
    }

    return value.toFixed(2) + " " + units[unit];
};

const generate_html = function(dirname, recursive) {
    let html = [];
    
    const path_index_print = path.posix.join("/", dirname, "/");
    const path_index = path.join(".", dirname);
    
    html.push(`<!doctype html>`);
    html.push(`<html>`);

    html.push(`<head>`);
    html.push(`<title>Index of ${path_index_print}</title>`);
    html.push(`<meta charset="utf-8"/>`);
    html.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0"/>`);
    html.push(`<script src="https://kit.fontawesome.com/5ca9dc49d2.js" crossorigin="anonymous"></script>`);
    html.push(`<style>`);
    html.push(`@media(prefers-color-scheme:normal){:root{color-scheme:light;}}`);
    html.push(`@media(prefers-color-scheme:dark){:root{color-scheme:dark;}}`);
    html.push(`:root{font-family:monospace;}`);
    html.push(`table{table-layout:fixed;text-align:left;width: 100%;}`);
    html.push(`</style>`);
    html.push(`</head>`);

    html.push(`<body>`);
    html.push(`<h1>Index of ${path_index_print}</h1>`);
    html.push(`<hr/>`);

    html.push(`<table>`);
    html.push(`<col style="width:2%">`);
    html.push(`<col style="width:70%">`);
    html.push(`<col style="width:20%">`);

    html.push(`<thead>`);
    html.push(`<tr>`);
    html.push(`<th></th>`);
    html.push(`<th><h2>Filename<h2></th>`);
    html.push(`<th><h2>Size<h2></th>`);
    html.push(`</tr>`);
    html.push(`</thead>`);

    html.push(`<tbody>`);

    if(recursive) {
        html.push(`<tr>`);
        html.push(`<td><i class="${directory_icon_parent}"></i></td>`);
        html.push(`<td><a href="../index.html">../</a></td>`);
        html.push(`<td></td>`);
        html.push(`</tr>`);
    }

    let dir_list = [];
    let file_list = [];

    try {
        fs.readdirSync(path_index, { withFileTypes: true }).forEach(function(file) {
            const filep = path.posix.parse(file.name);

            if(file.isDirectory() && filep.name !== config.output_dir && !config.ignore_dirs.includes(filep.name)) {
                generate_html(path.posix.join(path_index, file.name), true);
                dir_list.push({ f: file, p: filep });
                return;
            }

            if(file.isFile() && !config.ignore_files.includes(file.name) && !config.ignore_file_extensions.includes(filep.ext)) {
                file_list.push({ f: file, p: filep, s: fs.statSync(path.join(path_index, file.name)) });
                return;
            }
        });
    }
    catch(ex) {
        html.push(`<tr>`);
        html.push(`<td><i class="${error_icon}"></i></td>`);
        html.push(`<td>fs.readdir("${dirname}", ${recursive}) failed:</td>`);
        html.push(`<td></td>`);
        html.push(`</tr>`);

        ex.toString().split("\n").forEach(function(line) {
            html.push(`<tr>`);
            html.push(`<td></td>`);
            html.push(`<td>${line}</td>`);
            html.push(`<td></td>`);
            html.push(`</tr>`);
        });

        console.error(ex);
    }

    dir_list.sort(function(a, b) { return a.f.name > b.f.name; });
    dir_list.forEach(function(file) {
        html.push(`<tr>`);
        html.push(`<td><i class="${directory_icon_default}"></i></td>`);
        html.push(`<td><a href="${file.f.name}/index.html">${file.p.name}/</a></td>`);
        html.push(`<td></td>`);
        html.push(`</tr>`);
    });

    file_list.sort(function(a, b) { return (a.p.ext > b.p.ext) && (a.f.name > b.f.name); });
    file_list.forEach(function(file) {
        html.push(`<tr>`);
        html.push(`<td><i class="${make_file_icon_class(file.p)}"></i></td>`);
        html.push(`<td><a href="${config.file_prefix}/${path.posix.join(dirname, file.f.name)}">${file.f.name}</a></td>`);
        html.push(`<td>${make_readable_size(file.s.size)}</td>`);
        html.push(`</tr>`);
    });

    html.push(`</tbody>`);
    html.push(`</body>`);
    html.push(`</html>`);

    fs.writeFileSync(path.join(path_index, "index.html"), html.join(""));
};

generate_html("/", false);
