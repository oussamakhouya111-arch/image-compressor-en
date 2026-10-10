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
    const maxWidth = Number($("#maxw").value);
    const type = $("#format").value;
    const targetMode = $("#target-enabled").checked;
    let width = item.bitmap.width, height = item.bitmap.height;
    if (maxWidth && width > maxWidth) {
      height = Math.max(1, Math.round(height * maxWidth / width));
      width = maxWidth;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");

    const encode = async (w, h, quality) => {
      canvas.width = w;
      canvas.height = h;
      if (type === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(item.bitmap, 0, 0, w, h);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
      if (!blob) throw new Error("This browser could not export the image in the selected format.");
      return blob;
    };

    let blob = null;
    let usedQuality = Number($("#quality").value) / 100;
    item.targetRequested = targetMode;
    item.targetKB = targetMode ? Number($("#target-kb").value) : null;
    item.targetMet = null;
    item.actualWidth = width;
    item.actualHeight = height;

    if (targetMode) {
      const targetKB = Number($("#target-kb").value);
      if (!Number.isFinite(targetKB) || targetKB < 10 || targetKB > 5000) {
        throw new Error("Enter a target size between 10 KB and 5000 KB.");
      }
      const targetBytes = targetKB * 1024;
      let smallestBlob = null;

      for (let resizePass = 0; resizePass < 50; resizePass++) {
        const highBlob = await encode(width, height, 0.95);
        if (highBlob.size <= targetBytes) {
          blob = highBlob;
          usedQuality = 0.95;
          break;
        }

        const lowBlob = await encode(width, height, 0.30);
        smallestBlob = lowBlob;
        if (lowBlob.size <= targetBytes) {
          let bestBlob = lowBlob;
          let bestQuality = 0.30;
          let low = 0.30, high = 0.95;
          for (let attempt = 0; attempt < 8; attempt++) {
            const mid = (low + high) / 2;
            const candidate = await encode(width, height, mid);
            if (candidate.size <= targetBytes) {
              bestBlob = candidate;
              bestQuality = mid;
              low = mid;
            } else {
              high = mid;
            }
          }
          blob = bestBlob;
          usedQuality = bestQuality;
          break;
        }

        if (width <= 1 && height <= 1) {
          blob = lowBlob;
          usedQuality = 0.30;
          break;
        }

        const scale = Math.max(0.10, Math.min(0.85, Math.sqrt(targetBytes / lowBlob.size) * 0.90));
        let nextWidth = Math.max(1, Math.floor(width * scale));
        let nextHeight = Math.max(1, Math.floor(height * scale));
        if (nextWidth === width && nextHeight === height) {
          if (width >= height && width > 1) nextWidth = width - 1;
          else if (height > 1) nextHeight = height - 1;
        }
        width = nextWidth;
        height = nextHeight;
      }

      if (!blob && smallestBlob) {
        blob = await encode(width, height, 0.30);
        usedQuality = 0.30;
      }
      item.targetMet = Boolean(blob && blob.size <= targetBytes);
    } else {
      blob = await encode(width, height, usedQuality);
    }

    if (!blob) throw new Error("The image could not be compressed. Try another file.");
    if (item.url) URL.revokeObjectURL(item.url);
    item.blob = blob;
    item.url = URL.createObjectURL(blob);
    item.extension = type === "image/webp" ? "webp" : "jpg";
    item.error = "";
    item.usedQuality = usedQuality;
    item.actualWidth = width;
    item.actualHeight = height;
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
      if (item.targetRequested) {
        const target = document.createElement("span");
        target.className = item.targetMet ? "target-result" : "target-result target-result-warn";
        target.textContent = "Target " + item.targetKB + " KB " + (item.targetMet ? "reached" : "not reached");
        sizes.append(target);
      }
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
    const targetMode = $("#target-enabled").checked;
    if (!good.length) {
      $("#status").textContent = "Processing selected images…";
    } else if (targetMode) {
      const reached = good.filter((item) => item.targetMet).length;
      $("#status").textContent = reached + " of " + good.length + " image(s) reached the target size. Review dimensions and quality before downloading.";
    } else {
      $("#status").textContent = "Compression complete. Review each result before downloading.";
    }
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

  const targetEnabled = $("#target-enabled");
  const targetKBInput = $("#target-kb");
  const qualityInput = $("#quality");
  function syncTargetMode() {
    targetKBInput.disabled = !targetEnabled.checked;
    qualityInput.disabled = targetEnabled.checked;
    qualityInput.closest(".field").classList.toggle("field-muted", targetEnabled.checked);
  }
  const requestedTarget = new URLSearchParams(window.location.search).get("target");
  if (requestedTarget !== null && /^\d+$/.test(requestedTarget)) {
    const requestedKB = Number(requestedTarget);
    if (requestedKB >= 10 && requestedKB <= 5000) {
      targetKBInput.value = String(requestedKB);
      targetEnabled.checked = true;
    }
  }
  syncTargetMode();
  targetEnabled.addEventListener("change", () => { syncTargetMode(); if (items.length) scheduleReprocess(); });
  targetKBInput.addEventListener("change", () => {
    const value = Number(targetKBInput.value);
    if (!Number.isFinite(value) || value < 10) targetKBInput.value = "10";
    if (Number(targetKBInput.value) > 5000) targetKBInput.value = "5000";
    if (items.length && targetEnabled.checked) scheduleReprocess();
  });
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