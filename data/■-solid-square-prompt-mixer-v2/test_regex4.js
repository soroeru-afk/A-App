const regex = /[。！？：…・、,」』】）]$/;
console.log("(masterpiece:1.2)", regex.test("(masterpiece:1.2)"));
console.log("User：", regex.test("User："));
console.log("hello", regex.test("hello"));
console.log("<lora:model:1>", regex.test("<lora:model:1>"));
console.log("Drive保存", regex.test("Drive保存"));
