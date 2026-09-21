(() => {
  "use strict";

  const API_BASE = "http://localhost:8888";
  const BAR_COUNT = 20;

  const form = document.getElementById("predict-form");
  const submitBtn = document.getElementById("submit-btn");
  const intakePanel = document.querySelector(".intake");
  const receiverPanel = document.querySelector(".receiver");

  const stateIdle = document.getElementById("state-idle");
  const stateLoading = document.getElementById("state-loading");
  const stateResult = document.getElementById("state-result");
  const stateError = document.getElementById("state-error");

  const scoreNumberEl = document.getElementById("score-number");
  const scoreBandEl = document.getElementById("score-band");
  const scoreContextEl = document.getElementById("score-context");
  const errorCopyEl = document.getElementById("error-copy");

  const meterIdle = document.getElementById("meter-idle");
  const meterLoading = document.getElementById("meter-loading");
  const meterResult = document.getElementById("meter-result");

  // ---------------------------------------------------------
  // Build the bar meters. Bars get a mild organic base-height
  // pattern so the idle/resting state reads as a waveform,
  // not a row of identical blocks.
  // ---------------------------------------------------------
  function buildMeter(container, { interactive = false } = {}) {
    container.innerHTML = "";
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement("div");
      bar.className = "bar";
      const base = 14 + Math.round(10 * Math.abs(Math.sin(i * 0.7)));
      bar.style.height = `${base}%`;
      bar.style.setProperty("--d", `${(i % 6) * 0.08}s`);
      bar.style.setProperty("--h1", `${base}%`);
      bar.style.setProperty("--h2", `${Math.min(90, base + 35)}%`);
      container.appendChild(bar);
    }
  }

  buildMeter(meterIdle);
  buildMeter(meterLoading);
  buildMeter(meterResult);

  // ---------------------------------------------------------
  // Keep the receiver panel's height locked to the intake
  // panel's own content height (desktop two-column layout
  // only) — never the other way around.
  // ---------------------------------------------------------
  const desktopQuery = window.matchMedia("(min-width: 921px)");

  function syncReceiverHeight() {
    if (desktopQuery.matches) {
      receiverPanel.style.height = `${intakePanel.offsetHeight}px`;
    } else {
      receiverPanel.style.height = "";
    }
  }

  syncReceiverHeight();
  window.addEventListener("resize", syncReceiverHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(syncReceiverHeight).observe(intakePanel);
  }

  // ---------------------------------------------------------
  // Segmented control (stress_level) wiring
  // ---------------------------------------------------------
  const segGroup = document.getElementById("stress_level_group");
  const stressHiddenInput = document.getElementById("stress_level");
  segGroup.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      segGroup.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      stressHiddenInput.value = btn.dataset.value;
      clearFieldError(stressHiddenInput);
    });
  });

  // ---------------------------------------------------------
  // Field-level error helpers
  // ---------------------------------------------------------
  function fieldWrapper(input) {
    return input.closest(".field");
  }

  function setFieldError(input, message) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.add("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = message;
  }

  function clearFieldError(input) {
    const wrap = fieldWrapper(input);
    if (!wrap) return;
    wrap.classList.remove("field-error");
    const msgEl = wrap.querySelector(".error-msg");
    if (msgEl) msgEl.textContent = "";
  }

  function clearAllErrors() {
    form.querySelectorAll(".field").forEach((f) => f.classList.remove("field-error"));
    form.querySelectorAll(".error-msg").forEach((m) => (m.textContent = ""));
  }

  // ---------------------------------------------------------
  // Client-side validation mirroring the StudentData model
  // ---------------------------------------------------------
  function validate(payload) {
    const errors = [];

    const numericChecks = [
      ["age", 10, 100],
      ["avg_daily_usage_hours", 0, 24],
      ["daily_unlocks", 0, Infinity],
      ["study_hours", 0, 24],
      ["physical_activity_hours", 0, 24],
      ["sleep_hours_per_night", 0, 24],
    ];

    numericChecks.forEach(([key, min, max]) => {
      const input = document.getElementById(key);
      const val = payload[key];
      if (val === "" || val === null || Number.isNaN(val)) {
        errors.push([input, "This field is required."]);
      } else if (val < min || val > max) {
        errors.push([input, `Must be between ${min} and ${max === Infinity ? "0+" : max}.`]);
      }
    });

    ["gender", "country", "academic_level", "most_used_platform", "purpose_of_use"].forEach((key) => {
      const input = document.getElementById(key);
      if (!payload[key] || String(payload[key]).trim() === "") {
        errors.push([input, "This field is required."]);
      }
    });

    if (!payload.stress_level) {
      errors.push([stressHiddenInput, "Pick a stress level."]);
    }

    return errors;
  }

  // ---------------------------------------------------------
  // Gather form data into the exact StudentData shape
  // ---------------------------------------------------------
  function collectPayload() {
    const fd = new FormData(form);
    return {
      age: fd.get("age") === "" ? NaN : parseInt(fd.get("age"), 10),
      gender: fd.get("gender") || "",
      country: (fd.get("country") || "").trim(),
      academic_level: fd.get("academic_level") || "",
      most_used_platform: fd.get("most_used_platform") || "",
      purpose_of_use: fd.get("purpose_of_use") || "",
      avg_daily_usage_hours: fd.get("avg_daily_usage_hours") === "" ? NaN : parseFloat(fd.get("avg_daily_usage_hours")),
      daily_unlocks: fd.get("daily_unlocks") === "" ? NaN : parseInt(fd.get("daily_unlocks"), 10),
      study_hours: fd.get("study_hours") === "" ? NaN : parseFloat(fd.get("study_hours")),
      physical_activity_hours: fd.get("physical_activity_hours") === "" ? NaN : parseFloat(fd.get("physical_activity_hours")),
      sleep_hours_per_night: fd.get("sleep_hours_per_night") === "" ? NaN : parseFloat(fd.get("sleep_hours_per_night")),
      stress_level: fd.get("stress_level") || "",
    };
  }

  // ---------------------------------------------------------
  // UI state switching
  // ---------------------------------------------------------
  function showState(name) {
    [stateIdle, stateLoading, stateResult, stateError].forEach((el) => (el.hidden = true));
    ({ idle: stateIdle, loading: stateLoading, result: stateResult, error: stateError }[name]).hidden = false;
    meterLoading.classList.toggle("tuning", name === "loading");
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle("loading", isSubmitting);
  }

  function bandFor(score) {
    if (score < 4) {
      return {
        label: "Weak signal",
        context: "Your responses suggest elevated strain right now. Small shifts in sleep or screen time can go a long way.",
        color: "var(--rust)",
      };
    }
    if (score < 7) {
      return {
        label: "Steady signal",
        context: "Your rhythm looks fairly steady, with some room to recover and reset.",
        color: "var(--brass)",
      };
    }
    return {
      label: "Strong signal",
      context: "Your habits point to a well-supported, resilient baseline. Keep it up.",
      color: "var(--moss)",
    };
  }

  function renderResult(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const { label, context, color } = bandFor(clamped);

    scoreNumberEl.textContent = score.toFixed(2);
    scoreBandEl.textContent = label;
    scoreContextEl.textContent = context;

    const lit = Math.round((clamped / 10) * BAR_COUNT);
    const bars = meterResult.querySelectorAll(".bar");
    bars.forEach((bar, i) => {
      if (i < lit) {
        const pct = 20 + Math.round(((i + 1) / BAR_COUNT) * 70);
        bar.style.height = `${pct}%`;
        bar.style.background = color;
      } else {
        bar.style.height = "10%";
        bar.style.background = "var(--dial-line)";
      }
    });

    showState("result");
  }

  function renderError(label, copy) {
    errorCopyEl.textContent = copy;
    showState("error");
  }

  // ---------------------------------------------------------
  // Parse FastAPI / Pydantic 422 error responses into
  // field-level messages where possible
  // ---------------------------------------------------------
  function applyServerValidationErrors(detail) {
    if (!Array.isArray(detail)) return false;
    let matched = false;
    detail.forEach((err) => {
      const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null;
      const input = field ? document.getElementById(field) : null;
      const target = field === "stress_level" ? stressHiddenInput : input;
      if (target) {
        setFieldError(target, err.msg || "Invalid value.");
        matched = true;
      }
    });
    return matched;
  }

  // ---------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const payload = collectPayload();
    const clientErrors = validate(payload);

    if (clientErrors.length > 0) {
      clientErrors.forEach(([input, msg]) => input && setFieldError(input, msg));
      clientErrors[0][0]?.focus?.();
      return;
    }

    setSubmitting(true);
    showState("loading");

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const body = await res.json().catch(() => null);
        const matched = body && applyServerValidationErrors(body.detail);
        renderError(
          "Check your inputs",
          matched
            ? "The API rejected a few fields — details are marked on the form."
            : "The API rejected this submission. Please review your inputs and try again."
        );
        return;
      }

      if (!res.ok) {
        let detailMsg = `The API responded with status ${res.status}.`;
        const body = await res.json().catch(() => null);
        if (body && typeof body.detail === "string") detailMsg = body.detail;
        renderError("Prediction failed", detailMsg);
        return;
      }

      const data = await res.json();
      if (typeof data.predicted_mental_health_score !== "number") {
        renderError("Unexpected response", "The API responded, but the score was missing or malformed.");
        return;
      }

      renderResult(data.predicted_mental_health_score);
    } catch (err) {
      renderError(
        "Signal lost",
        `Couldn't connect to ${API_BASE}. Make sure the backend is running (uvicorn main:app --port 8000 --reload) and reachable from this page.`
      );
    } finally {
      setSubmitting(false);
    }
  });

  // live-clear errors as the user edits
  form.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
    el.addEventListener("change", () => clearFieldError(el));
  });
})();
