import { unlink } from "fs";

export async function removeFile(path) {
  try {
    await unlink(path, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.log("Error while Removing file", error.message);
  }
}
