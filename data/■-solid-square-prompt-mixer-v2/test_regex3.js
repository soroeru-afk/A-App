const regex = /[。！？.!?：:…・、,」』】)）\]}\""']$/;
console.log("(masterpiece:1.2)", regex.test("(masterpiece:1.2)"));
console.log("tag", regex.test("tag"));
