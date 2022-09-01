const fs = require("fs");
const FileType = require("file-type-cjs");

const downloadFile = (response) => {
  const reader = response.body.getReader();
  return new ReadableStream({
    start(controller) {
      return pump();
      function pump() {
        return reader.read().then(({ done, value }) => {
          // When no more data needs to be consumed, close the stream
          if (done) {
            const outputFileName = `${dir}/${firstName}-${lastName}`;
            const stream = fs.createWriteStream(outputFileName);
            // downloadFile(`${IMAGE_URL}/${category}?w=640&h=480`,outputFileName, )
            stream.pipe(response);
            controller.close();
            return;
          }
          // Enqueue the next data chunk into our target stream
          controller.enqueue(value);
          return pump();
        });
      }
    }
  })
}

const seedImages = async (category, { user, dir }) => {
  const IMAGE_URL = process.env.IMAGE_URL;

  const { firstName, lastName } = user;
  // return Promise.all(
  //   userAccounts.map(async (account) => {
  const response = await fetch(`${IMAGE_URL}/${category}?w=640&h=480`).then(downloadFile);
  // const body = response.body.getReader();
  // const arrayBuffer = await response.arrayBuffer()
  // const buffer = Buffer.from(arrayBuffer);
  // const fileType = await FileType.fromBuffer(buffer);

  // if (fileType.ext) {
  //   const outputFileName = `${dir}/${firstName}-${lastName}`;
  //   const stream = fs.createWriteStream(outputFileName);
  //   // downloadFile(`${IMAGE_URL}/${category}?w=640&h=480`,outputFileName, )
  //   stream.pipe(body);
  // } else {
  //   console.log(
  //     "File type could not be reliably determined! The binary data may be malformed! No file saved!"
  //   );
  // }
  //   })
  // );
};

module.exports = {
  seedImages,
};
