const configureTemplate = `
<div style="margin: 1rem" class="md-typeset">
  <h2>Configure auto redirect</h2>
  <p>
    If you are currently using NAIS, you can configure this generic site to <br>
    automatically redirect to your organizations custom documentation.
  </p>
  <form>
    <input type="text" id="tenant-redirect-input" placeholder="Organization name" class="md-input" />
    <button id="tenant-redirect-save" class="md-button md-button--primary" type="submit">Save</button>
    <button id="tenant-redirect-cancel" class="md-button">Cancel</button>
  </form>
  <p style="font-size: .64rem">
    <b>How it works:</b><br>
    After you have configured your organization, you will be redirected to your custom documentation<br>
    when you visit this site in the future.<br>
    It is only stored client side, and will be removed if you cancel the redirect or clear your browser cache.<br>
    This is done to ensure that you can revert back to the generic documentation at any time.
  </p>
</div>
`;

const redirectTemplate = `
<div style="margin: 1rem" class="md-typeset">
  <h2>Redirecting</h2>
  <p>
    You are soon being redirected to the custom documentation for <code>TENANT</code>.<br>
    <a href="https://doc.TENANT.cloud.nais.io">Click here to skip waiting</a>.
  </p>
  <p>
    To cancel the redirect, click <code>ESC</code> on your keyboard or the button below.
  </p>
  <button id="tenant-redirect-cancel" class="md-button">Cancel</button>
</div>
`;

function showRedirectModal() {
  /**
   * @type {HTMLDialogElement}
   */
  const dialog = document.createElement("dialog");
  dialog.id = "tenant-redirect-dialog";
  dialog.style = "background-color: var(--md-default-bg-color);";
  dialog.innerHTML = configureTemplate;
  document.body.appendChild(dialog);
  dialog.showModal();

  /**
   * @type {HTMLInputElement}
   */
  const input = dialog.querySelector("#tenant-redirect-input");
  /**
   * @type {HTMLFormElement}
   */
  const form = dialog.querySelector("form");
  /**
   * @type {HTMLButtonElement}
   */
  const cancel = dialog.querySelector("#tenant-redirect-cancel");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.toLowerCase().trim();
    localStorage.setItem("redirect-tenant", val);
    dialog.close();
    doRedirect();
  });

  cancel.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
    dialog.remove();
  });
}

function noRedirectMode() {
  document.onclick = (e) => {
    if (!e.target) return;
    const target = e.target;
    if (target.dataset.action === "configure-redirect") {
      showRedirectModal();
    }
  };
}

function doRedirect() {
  const tenant = localStorage.getItem("redirect-tenant");
  if (tenant) {
    // Redirect to tenant, but keep path, query params and hash
    window.location.href =
      "https://doc." +
      tenant +
      ".cloud.nais.io" +
      window.location.pathname +
      window.location.search +
      window.location.hash;
  }
}

function handleRedirect() {
  const dialog = document.createElement("dialog");
  dialog.id = "tenant-redirect-dialog";
  dialog.style = "background-color: var(--md-default-bg-color);";
  dialog.innerHTML = redirectTemplate.replaceAll(
    "TENANT",
    localStorage.getItem("redirect-tenant")
  );
  document.body.appendChild(dialog);
  dialog.showModal();

  const cancel = setTimeout(doRedirect, 4000);

  dialog.addEventListener("close", () => {
    clearTimeout(cancel);
    dialog.remove();
    localStorage.removeItem("redirect-tenant");
  });

  const cancelBtn = dialog.querySelector("#tenant-redirect-cancel");
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.close();
  });
}

(function () {
  if (window.location.hostname.indexOf("cloud.nais.io") > 0) {
    return;
  }
  if (typeof HTMLDialogElement !== "function") {
    return;
  }

  if (localStorage.getItem("redirect-tenant")) {
    handleRedirect();
  }

  noRedirectMode();
})();
