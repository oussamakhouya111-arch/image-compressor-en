(() => {
  const $ = (selector) => document.querySelector(selector);
  const input = $("#file");
  if (!input) return;
  const items = [];
  let debounceTimer = null;
  let runId = 0;
  const formatBytes = (bytes) => bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + " KB" : (bytes / (1024 * 1024)).toFixed(2) + " MB";
  const safeBaseName = (name) => name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "_");

  async function compress(item) {
    const quality = Number($("#quality").value) / 100;
    const maxWidth = Number($("#maxw").value);
    const type = $("#format").value;
    let width = item.bitmap.width, height = item.bitmap.height;
    if (maxWidth && width > maxWidth) { height = Math.max(1, Math.round(height * maxWidth / width)); width = maxWidth; }
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    if (type === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
    ctx.drawImage(item.bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob) throw new Error("This browser could not export the image in the selected format.");
    if (item.url) URL.revokeObjectURL(item.url);
    item.blob = blob; item.url = URL.createObjectURL(blob); item.extension = type === "image/webp" ? "webp" : "jpg"; item.error = "";
  }
  function render(id) {
    if (id !== runId) return;
    const list = $("#list"), good = items.filter((item) => item.blob);
    $("#results").hidden = items.length === 0; list.replaceChildren();
    let before = 0, after = 0;
    good.forEach((item) => {
      before += item.file.size; after += item.blob.size;
      const percent = Math.round((1 - item.blob.size / item.file.size) * 100);
      const row = document.createElement("div"); row.className = "image-row";
      const image = document.createElement("img"); image.src = item.url; image.alt = "";
      const details = document.createElement("div");
      const filename = document.createElement("div"); filename.className = "filename"; filename.textContent = item.file.name;
      const sizes = document.createElement("div"); sizes.className = "sizes"; sizes.append(document.createTextNode(formatBytes(item.file.size) + " → " + formatBytes(item.blob.size) + " "));
      const saving = document.createElement("span"); saving.className = percent > 0 ? "saving" : "saving bad"; saving.textContent = percent > 0 ? "−" + percent + "%" : "No size reduction";
      sizes.append(saving); details.append(filename, sizes);
      const download = document.createElement("a"); download.className = "button"; download.href = item.url; download.download = safeBaseName(item.file.name) + "-compressed." + item.extension; download.textContent = "Download";
      row.append(image, details, download); list.append(row);
    });
    const pct = before ? Math.round((1 - after / before) * 100) : 0;
    $("#total").textContent = good.length ? good.length + " image(s): " + formatBytes(before) + " → " + formatBytes(after) + (pct > 0 ? " (−" + pct + "%)" : "") : "";
    const failed = items.filter((item) => item.error);
    $("#err").hidden = failed.length === 0;
    $("#err").textContent = failed.length ? failed.length + " file(s) could not be processed. Try a JPG, PNG, or WebP image." : "";
    $("#status").textContent = good.length ? "Compression complete. Review each result before downloading." : "Processing selected images…";
  }
  async function reprocess() {
    const id = ++runId; $("#status").textContent = "Compressing images…";
    for (const item of items) { if (id !== runId) return; try { await compress(item); } catch (error) { item.error = error && error.message ? error.message : "Compression failed"; } }
    render(id);
  }
  async function addFiles(fileList) {
    const files = Array.from(fileList).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (!files.length) { $("#err").hidden = false; $("#err").textContent = "Please select JPG, PNG, or WebP image files."; return; }
    $("#err").hidden = true;
    for (const file of files) {
      const item = {file, bitmap:null, blob:null, url:null, error:""};
      try { item.bitmap = await createImageBitmap(file); } catch { item.error = "Could not read this image."; }
      items.push(item);
    }
    await reprocess();
  }
  input.addEventListener("change", (event) => { addFiles(event.target.files); input.value = ""; });
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
  function scheduleReprocess() { clearTimeout(debounceTimer); debounceTimer = setTimeout(reprocess, 250); }
  $("#quality").addEventListener("input", () => { $("#qv").textContent = $("#quality").value; if (items.length) scheduleReprocess(); });
  $("#maxw").addEventListener("change", () => { if (items.length) scheduleReprocess(); });
  $("#format").addEventListener("change", () => { if (items.length) scheduleReprocess(); });
  $("#dlAll").addEventListener("click", () => Array.from(document.querySelectorAll("#list a[download]")).forEach((link, index) => setTimeout(() => link.click(), index * 350)));
  $("#clear").addEventListener("click", () => {
    runId++;
    items.forEach((item) => { if (item.url) URL.revokeObjectURL(item.url); if (item.bitmap && item.bitmap.close) item.bitmap.close(); });
    items.length = 0; $("#list").replaceChildren(); $("#results").hidden = true; $("#err").hidden = true; $("#status").textContent = "Choose images to begin.";
  });
})();