'use strict';
const e = {
  init: function () {
    e.postForm();
    e.paginateResult();
  },
  isVariableDefined: function (el) {
    return typeof !!el && el != 'undefined' && el != null;
  },
  getParents: function (el, selector, filter) {
    const result = [];
    const matchesSelector =
      el.matches ||
      el.webkitMatchesSelector ||
      el.mozMatchesSelector ||
      el.msMatchesSelector;

    // match start from parent
    el = el.parentElement;
    while (el && !matchesSelector.call(el, selector)) {
      if (!filter) {
        if (selector) {
          if (matchesSelector.call(el, selector)) {
            return result.push(el);
          }
        } else {
          result.push(el);
        }
      } else {
        if (matchesSelector.call(el, filter)) {
          result.push(el);
        }
      }
      el = el.parentElement;
      if (e.isVariableDefined(el)) {
        if (matchesSelector.call(el, selector)) {
          return el;
        }
      }
    }
    return result;
  },
  getNextSiblings: function (el, selector, filter) {
    let sibs = [];
    let nextElem = el.parentNode.firstChild;
    const matchesSelector =
      el.matches ||
      el.webkitMatchesSelector ||
      el.mozMatchesSelector ||
      el.msMatchesSelector;
    do {
      if (nextElem.nodeType === 3) continue; // ignore text nodes
      if (nextElem === el) continue; // ignore elem of target
      if (nextElem === el.nextElementSibling) {
        if (!filter || filter(el)) {
          if (selector) {
            if (matchesSelector.call(nextElem, selector)) {
              return nextElem;
            }
          } else {
            sibs.push(nextElem);
          }
          el = nextElem;
        }
      }
    } while ((nextElem = nextElem.nextSibling));
    return sibs;
  },
  on: function (selectors, type, listener) {
    document.addEventListener('DOMContentLoaded', () => {
      if (!(selectors instanceof HTMLElement) && selectors !== null) {
        selectors = document.querySelector(selectors);
      }
      selectors.addEventListener(type, listener);
    });
  },
  onAll: function (selectors, type, listener) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll(selectors).forEach((element) => {
        if (type.indexOf(',') > -1) {
          let types = type.split(',');
          types.forEach((type) => {
            element.addEventListener(type, listener);
          });
        } else {
          element.addEventListener(type, listener);
        }
      });
    });
  },
  removeClass: function (selectors, className) {
    if (!(selectors instanceof HTMLElement) && selectors !== null) {
      selectors = document.querySelector(selectors);
    }
    if (e.isVariableDefined(selectors)) {
      selectors.removeClass(className);
    }
  },
  removeAllClass: function (selectors, className) {
    if (e.isVariableDefined(selectors) && selectors instanceof HTMLElement) {
      document.querySelectorAll(selectors).forEach((element) => {
        element.removeClass(className);
      });
    }
  },
  toggleClass: function (selectors, className) {
    if (!(selectors instanceof HTMLElement) && selectors !== null) {
      selectors = document.querySelector(selectors);
    }
    if (e.isVariableDefined(selectors)) {
      selectors.toggleClass(className);
    }
  },
  toggleAllClass: function (selectors, className) {
    if (e.isVariableDefined(selectors) && selectors instanceof HTMLElement) {
      document.querySelectorAll(selectors).forEach((element) => {
        element.toggleClass(className);
      });
    }
  },
  addClass: function (selectors, className) {
    if (!(selectors instanceof HTMLElement) && selectors !== null) {
      selectors = document.querySelector(selectors);
    }
    if (e.isVariableDefined(selectors)) {
      selectors.addClass(className);
    }
  },
  select: function (selectors) {
    return document.querySelector(selectors);
  },
  selectAll: function (selectors) {
    return document.querySelectorAll(selectors);
  },
  Post: function (url, data) {
    return new Promise((resolve, reject) => {
      let current_status = 0;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          current_status = response.status;
          if ([200, 201, 203].includes(current_status)) {
            return response.json();
          } else {
            throw Error('Bad Request');
          }
        })
        .then((result) => {
          resolve({
            ...result,
            status: current_status,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  postForm: function () {
    let all_forms = e.selectAll('form[data-form="true"]');
    all_forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        let url = form.getAttribute('data-url');
        let callback = e.select(form.getAttribute('data-callback'));
        let submit_btn = form.querySelector('button[type="submit"]');
        let button_cache = submit_btn.innerHTML;
        submit_btn.setAttribute('disabled', 'disabled');
        submit_btn.innerHTML = `Loading...`;
        let current_status = 0;
        const formData = new FormData(event.target);
        const jsonObject = {};
        formData.forEach((value, key) => {
          if (jsonObject[key]) {
            if (!Array.isArray(jsonObject[key])) {
              jsonObject[key] = [jsonObject[key], value];
            } else {
              jsonObject[key].push(value);
            }
          } else {
            jsonObject[key] = value;
          }
        });
        const jsonData = JSON.stringify(jsonObject);
        fetch(url, {
          method: form.getAttribute('method'),
          body: jsonData,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            current_status = response.status;
            if ([200, 201, 203, 401, 400, 404].includes(current_status)) {
              return response.json();
            } else {
              throw Error('Bad Request');
            }
          })
          .then((result) => {
            if (typeof result.redirect === 'undefined') {
              submit_btn.removeAttribute('disabled');
              submit_btn.innerHTML = button_cache;
            } else {
              setTimeout(() => {
                window.location = result.redirect;
              }, 2000);
            }
            if ([200, 201].includes(current_status)) {
              callback.innerHTML = `<div class="alert alert-success" role="alert">
                          <strong>Success! </strong> ${result.message}
                      </div>`;
            } else {
              if (current_status === 400) {
                if (result.errors) {
                  if (result.errors.length > 0) {
                    result.message = result.errors[0].message;
                  }
                }
              }
              callback.innerHTML = `<div class="alert alert-danger" role="alert">
                          <strong>Error! </strong> ${result.message}
                      </div>`;
            }
          })
          .catch((err) => {
            console.log(err);
            submit_btn.removeAttribute('disabled');
            submit_btn.innerHTML = button_cache;
            callback.innerHTML = `<div class="alert alert-danger" role="alert">
                      <strong>Error! </strong> Some error occured.
                  </div>`;
          });
      });
    });
  },
  get_paginate_result: function (e, i) {
    document
      .querySelector('form[data-paginate-form="true"]')
      .setAttribute('data-page', i);
    document
      .querySelector('form[data-paginate-form="true"]')
      .querySelector('button[type="submit"]')
      .click();
  },
  paginateResult: function () {
    let all_forms = e.selectAll('form[data-paginate-form="true"]');
    all_forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        var url = form.getAttribute('data-url');
        var page = form.getAttribute('data-page');
        const main_table = form.querySelector('#main_table');
        const table_body = form.querySelector('#table_body');
        const table_loading = form.querySelector('#table_loading');
        const table_notfound = form.querySelector('#table_not_found');
        const total_data = form.querySelector('#total_data');
        const table_pagination_row = form.querySelector(
          '#table_pagination_row',
        );

        main_table.classList.add('d-none');
        table_body.classList.add('d-none');
        table_notfound.classList.add('d-none');
        total_data.classList.add('d-none');
        table_pagination_row.classList.add('d-none');
        table_loading.classList.remove('d-none');

        const formData = new FormData(event.target);
        const jsonObject = {};
        formData.forEach((value, key) => {
          jsonObject[key] = value;
        });
        let current_status = 0;

        // query from formData
        const queryString = new URLSearchParams({
          ...jsonObject,
          page,
        }).toString();

        fetch(`${url}?${queryString}`, {
          method: form.getAttribute('method'),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            current_status = response.status;
            if ([200, 201].includes(current_status)) {
              return response.json();
            } else {
              throw Error('Bad Request');
            }
          })
          .then((rsp) => {
            if (rsp.data_exist == true) {
              main_table.classList.remove('d-none');
              total_data.classList.remove('d-none');
              table_body.innerHTML = rsp.data;
              total_data.textContent = rsp.total_count;
              table_pagination_row.innerHTML = rsp.pagination;
              table_pagination_row.classList.remove('d-none');
              table_body.classList.remove('d-none');
              table_loading.classList.add('d-none');
              table_notfound.classList.add('d-none');
            } else {
              main_table.classList.add('d-none');
              table_body.innerHTML = '';
              table_pagination_row.innerHTML = '';
              total_data.textContent = 0;
              table_body.classList.add('d-none');
              table_loading.classList.add('d-none');
              table_notfound.classList.remove('d-none');
            }

            document.querySelector('#table_pagination_row').innerHTML =
              rsp.pagination;
          });
      });
    });
  },
};

e.init();

function submit_admin_thumble(e, event, elm, dir) {
  var data = new FormData();
  data.append("attachment", e.target.files[0]);
  data.append('path', dir);
  event.querySelector("img").src = '/images/loading.gif';

  const options = {
    method: 'POST',
    body: data
  };

  fetch(CDN_API_URL, options)
    .then((response) => response.json())
    .then((result) => {
      if (typeof result.payload !== 'undefined') {
        $(elm).val(result.payload.filename);
        event.querySelector("img").src = `${CDN_URL}/${dir}/${result.payload.filename}`;
      } else {
        alert(result.message);
      }
    }).catch((err) => {
      console.log('error: ', err)
      alert('Oops! Some error occured.');
    });
}

function upload_admin_thumble(event, elm, dir) {
  var input = document.createElement('input');
  input.type = 'file';
  input.onchange = e => {
    submit_admin_thumble(e, event, elm, dir);
  };
  input.click();
}


$('form[paginate="true"]').submit(function (e) {
  e.preventDefault();
  var url = $(this).attr("url");
  var page = $(this).attr("page");
  const main_table = $(this).find("#main_table");
  const table_body = $(this).find("#table_body");
  const table_loading = $(this).find("#table_loading");
  const table_notfound = $(this).find("#table_not_found");
  const total_data = $(this).find("#total_data");
  const table_pagination_row = $(this).find("#table_pagination_row");

  main_table.hide();
  table_body.hide();
  table_notfound.hide();
  total_data.hide();
  table_pagination_row.hide();
  table_loading.show();

  $.ajax({
    url: url + `?page=${page}`,
    data: $(this).serialize(),
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    success: function (rsp) {
      if (rsp.data_exist == true) {
        main_table.show();
        total_data.show();
        table_body.html(rsp.data);
        total_data.text(rsp.total_count);
        table_pagination_row.html(rsp.pagination);
        table_pagination_row.show();
        table_body.show();
        table_loading.hide();
        table_notfound.hide();
      } else {
        main_table.hide();
        table_body.html("");
        table_pagination_row.html("");
        total_data.text(0);
        table_body.hide();
        table_loading.hide();
        table_notfound.show();
      }

      $("#paginate_rows").html(rsp.paginate_data);
    }
  });
});

function get_paginate_result(e, i) {
  e.closest('form[paginate="true"]').setAttribute("page", i);
  $('form[paginate="true"]').submit();
}

function checkVal(arr, val) {
  for (let a of arr) {
    if (a.value == val) {
      return false;
    }
  }
  return true;
}
function removeMultiBadge(e) {
  let ecls = e.closest('.multi-search');
  let input_val = JSON.parse(ecls.querySelector('.multi-search-data-input').value);
  for (let i = 0; i < input_val.length; i++) {
    if (input_val[i].value == e.getAttribute('data-value')) {
      input_val.splice(i, 1);
    }
  }
  ecls.querySelector('.multi-search-data-input').value = JSON.stringify(input_val);
  e.closest('.multi-search-label').remove();
}
function chooseMultiData(e) {
  let ecls = e.closest('.multi-search');
  let input_val = JSON.parse(ecls.querySelector('.multi-search-data-input').value);
  const einputl = ecls.querySelector('.multi-search-input');

  if (checkVal(input_val, e.getAttribute('data-value'))) {
    input_val.push({
      key: e.getAttribute('data-key'),
      value: e.getAttribute('data-value')
    });
    ecls.querySelector('.multi-search-data-input').value = JSON.stringify(input_val);
    einputl.insertAdjacentHTML("beforebegin", `<span class="multi-search-label label label-success">${e.getAttribute('data-key')} <a data-value="${e.getAttribute('data-value')}" href="javascript:;" onclick="removeMultiBadge(this)"><svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20" height="18" viewBox="0 0 512 512"><title>Close</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg></a></span>`)
    e.remove();
  } else {
    alert('Already exist.');
  }
}
document.querySelectorAll('.multi-search').forEach((el) => {
  let m_input = el.querySelector('.multi-search-input input');
  m_input.addEventListener('input', (event) => {
    if (event.target.value.trim() == '') {
      el.setAttribute('data-search', 'false');
      var key = event.keyCode || event.charCode;
    } else {
      el.setAttribute('data-search', 'true');
      const url = el.getAttribute('data-url');
      const formData = {
        keyword: event.target.value,
        excludes: el.querySelector('.multi-search-data-input').value
      }

      $.ajax({
        url: url,
        data: formData,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        success: function (rsp) {
          if (rsp.status == 1) {
            let html_el = ``;
            for (let result of rsp.data) {
              html_el += `<li onclick="chooseMultiData(this)" data-key="${result.key}" data-value="${result.value}">${result.key}</li>`;
            }
            el.querySelector('.multi-search-list').innerHTML = html_el;
          }
          if (rsp.status == 0) {
            alert('Oops! Some error occured.');
          }
        }, error: function (err) {
          alert('Oops! Some error occured.');
        }
      });
    }
  });
});

function removeData(e, id, url) {
  if (confirm('Are you sure you want to delete this item?')) {
    $.ajax({
      url: url,
      data: {
        id
      },
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      success: function (rsp) {
        e.closest('tr').remove();
      }, error: function (err) {
        alert('Oops! Some error occured.');
      }
    });
  }
}