import assert from 'node:assert';
import { it } from 'node:test';

import { requireAmd } from './require_amd.js';

const jqueryPrefilter = await requireAmd('src/util/jquery_prefilter');

function assertFilter(before, after, shouldWarn) {
  const { warn, html } = jqueryPrefilter(before);
  assert.equal(html, after);
  assert.ok(
    warn === shouldWarn,
    `${before} is expected ${shouldWarn ? 'to' : 'not to'} produce a warning`,
  );
}
it('closes non-void elements but does not touch void elements', () => {
  assertFilter(
    `<textarea /><input /><img /><div/>`,
    `<textarea ></textarea><input /><img /><div></div>`,
    true,
  );
});

it('ignores single elements without children', () => {
  assertFilter(`<div />`, `<div />`, false);
  assertFilter(` <div /> `, ` <div /> `, false);
  assertFilter(`<input />`, `<input />`, false);
  assertFilter(` <input /> `, ` <input /> `, false);
});

it('ignores svg content when isolated', () => {
  assertFilter(`<svg><path /></svg>`, `<svg><path /></svg>`, false);
  assertFilter(
    `<svg><path/></svg><svg><line/></svg>`,
    `<svg><path/></svg><svg><line/></svg>`,
    false,
  );
  assertFilter(`<div/><svg><path/></svg>`, `<div/><svg><path/></svg>`, false);
});

it('ignores svg when there are no issues outside of it', () => {
  assertFilter(
    `<div><span></span></div><svg><path /></svg><a></a>`,
    `<div><span></span></div><svg><path /></svg><a></a>`,
    false,
  );
});

it('transforms svg content when other tags need to be transformed', () => {
  assertFilter(
    `<div/><svg></svg><span/><svg><path/></svg>`,
    `<div></div><svg></svg><span></span><svg><path></path></svg>`,
    true,
  );
});

it('handles multi-line html', () => {
  assertFilter(
    `
      <div/>
      <span/>
    `,
    `
      <div></div>
      <span></span>
    `,
    true,
  );

  assertFilter(
    `
      <div
        data-label="abc"
      />
      <span/>
    `,
    `
      <div
        data-label="abc"
      ></div>
      <span></span>
    `,
    true,
  );
});

it('handles multi-line svg', () => {
  assertFilter(
    `<svg id="mol1">
        <line x1="100" y1="51.36"  />
     </svg>`,
    `<svg id="mol1">
        <line x1="100" y1="51.36"  />
     </svg>`,
    false,
  );
});
