const fs = require("fs"),
    PNG = require("pngjs").PNG;

fs.createReadStream("in.png")
    .pipe(
        new PNG({
            colorType: 0,
            inputHasAlpha: true,
            deflateChunkSize: 256,
            filterType: 0,
        })
    )
    .on("parsed", function () {
        this.pack().pipe(fs.createWriteStream("out.png"));
    });
