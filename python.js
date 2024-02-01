/**
 * @file BitBake grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  // this resolves a conflict between the usage of ':' in a lambda vs in a
  // typed parameter. In the case of a lambda, we don't allow typed parameters.
  lambda: -2,
  typed_parameter: -1,
  conditional: -1,

  parenthesized_expression: 1,
  parenthesized_list_splat: 1,
  or: 10,
  and: 11,
  not: 12,
  compare: 13,
  bitwise_or: 14,
  bitwise_and: 15,
  xor: 16,
  shift: 17,
  plus: 18,
  times: 19,
  unary: 20,
  power: 21,
  call: 22,
};

module.exports.pythonCode = {
  python_function_definition: $ => seq(
    'def',
    field('name', $.python_identifier),
    field('parameters', $.parameters),
    optional(
      seq(
        '->',
        field('return_type', $.type),
      ),
    ),
    ':',
    field('body', $._suite),
  ),

  _statement: $ => choice(
    $._simple_statements,
    $._compound_statement,
  ),

  _simple_statements: $ => seq(
    sep1($._simple_statement, ';'),
    optional(';'),
    $._newline,
  ),

  _simple_statement: $ => choice(
    $.future_import_statement,
    $.import_statement,
    $.import_from_statement,
    $.print_statement,
    $.assert_statement,
    $.expression_statement,
    $.return_statement,
    $.delete_statement,
    $.raise_statement,
    $.pass_statement,
    $.break_statement,
    $.continue_statement,
    $.global_statement,
    $.nonlocal_statement,
    $.exec_statement,
  ),

  import_statement: $ => seq(
    'import',
    $._import_list,
  ),

  import_prefix: _ => repeat1('.'),

  relative_import: $ => seq(
    $.import_prefix,
    optional($.dotted_name),
  ),

  future_import_statement: $ => seq(
    'from',
    '__future__',
    'import',
    choice(
      $._import_list,
      seq('(', $._import_list, ')'),
    ),
  ),

  import_from_statement: $ => seq(
    'from',
    field('module_name', choice(
      $.relative_import,
      $.dotted_name,
    )),
    'import',
    choice(
      $.wildcard_import,
      $._import_list,
      seq('(', $._import_list, ')'),
    ),
  ),

  _import_list: $ => seq(
    commaSep1(field('name', choice(
      $.dotted_name,
      $.aliased_import,
    ))),
    optional(','),
  ),

  aliased_import: $ => seq(
    field('name', $.dotted_name),
    'as',
    field('alias', $.python_identifier),
  ),

  wildcard_import: _ => '*',

  print_statement: $ => choice(
    prec(1, seq(
      'print',
      $.chevron,
      repeat(seq(',', field('argument', $.expression))),
      optional(',')),
    ),
    prec(-3, prec.dynamic(-1, seq(
      'print',
      commaSep1(field('argument', $.expression)),
      optional(','),
    ))),
  ),

  chevron: $ => seq(
    '>>',
    $.expression,
  ),

  assert_statement: $ => seq(
    'assert',
    commaSep1($.expression),
  ),

  expression_statement: $ => choice(
    $.expression,
    seq(commaSep1($.expression), optional(',')),
    $.assignment,
    $.augmented_assignment,
    $.yield,
  ),

  named_expression: $ => seq(
    field('name', $._named_expression_lhs),
    ':=',
    field('value', $.expression),
  ),

  _named_expression_lhs: $ => choice(
    $.python_identifier,
    $.keyword_identifier,
  ),

  return_statement: $ => seq(
    'return',
    optional($._expressions),
  ),

  delete_statement: $ => seq(
    'del',
    $._expressions,
  ),

  _expressions: $ => choice(
    $.expression,
    $.expression_list,
  ),

  raise_statement: $ => seq(
    'raise',
    optional($._expressions),
    optional(seq('from', field('cause', $.expression))),
  ),

  pass_statement: _ => prec.left('pass'),
  break_statement: _ => prec.left('break'),
  continue_statement: _ => prec.left('continue'),

  global_statement: $ => seq(
    'global',
    commaSep1($.python_identifier),
  ),

  nonlocal_statement: $ => seq(
    'nonlocal',
    commaSep1($.python_identifier),
  ),

  exec_statement: $ => seq(
    'exec',
    field('code', choice($.python_string, $.python_identifier)),
    optional(
      seq(
        'in',
        commaSep1($.expression),
      ),
    ),
  ),

  type_parameter: $ => seq(
    '[',
    commaSep1($.type),
    ']',
  ),

  parenthesized_list_splat: $ => prec(PREC.parenthesized_list_splat, seq(
    '(',
    choice(
      alias($.parenthesized_list_splat, $.parenthesized_expression),
      $.list_splat,
    ),
    ')',
  )),

  argument_list: $ => seq(
    '(',
    optional(commaSep1(
      choice(
        $.expression,
        $.list_splat,
        $.dictionary_splat,
        alias($.parenthesized_list_splat, $.parenthesized_expression),
        $.keyword_argument,
      ),
    )),
    optional(','),
    ')',
  ),

  _compound_statement: $ => choice(
    $.if_statement,
    $.for_statement,
    $.while_statement,
    $.try_statement,
    $.with_statement,
    $.python_function_definition,
  ),

  if_statement: $ => seq(
    'if',
    field('condition', $.expression),
    ':',
    field('consequence', $._suite),
    repeat(field('alternative', $.elif_clause)),
    optional(field('alternative', $.else_clause)),
  ),

  elif_clause: $ => seq(
    'elif',
    field('condition', $.expression),
    ':',
    field('consequence', $._suite),
  ),

  else_clause: $ => seq(
    'else',
    ':',
    field('body', $._suite),
  ),

  for_statement: $ => seq(
    optional('async'),
    'for',
    field('left', $._left_hand_side),
    'in',
    field('right', $._expressions),
    ':',
    field('body', $._suite),
    field('alternative', optional($.else_clause)),
  ),

  while_statement: $ => seq(
    'while',
    field('condition', $.expression),
    ':',
    field('body', $._suite),
    optional(field('alternative', $.else_clause)),
  ),

  try_statement: $ => seq(
    'try',
    ':',
    field('body', $._suite),
    choice(
      seq(
        repeat1($.except_clause),
        optional($.else_clause),
        optional($.finally_clause),
      ),
      seq(
        repeat1($.except_group_clause),
        optional($.else_clause),
        optional($.finally_clause),
      ),
      $.finally_clause,
    ),
  ),

  except_clause: $ => seq(
    'except',
    optional(seq(
      $.expression,
      optional(seq(
        choice('as', ','),
        $.expression,
      )),
    )),
    ':',
    $._suite,
  ),

  except_group_clause: $ => seq(
    'except*',
    seq(
      $.expression,
      optional(seq(
        'as',
        $.expression,
      )),
    ),
    ':',
    $._suite,
  ),

  finally_clause: $ => seq(
    'finally',
    ':',
    $._suite,
  ),

  with_statement: $ => seq(
    optional('async'),
    'with',
    $.with_clause,
    ':',
    field('body', $._suite),
  ),

  with_clause: $ => choice(
    seq(commaSep1($.with_item), optional(',')),
    seq('(', commaSep1($.with_item), optional(','), ')'),
  ),

  with_item: $ => prec.dynamic(1, seq(
    field('value', $.expression),
  )),

  dotted_name: $ => prec(1, sep1($.python_identifier, '.')),

  not_operator: $ => prec(PREC.not, seq(
    'not',
    field('argument', $.expression),
  )),

  boolean_operator: $ => choice(
    prec.left(PREC.and, seq(
      field('left', $.expression),
      field('operator', 'and'),
      field('right', $.expression),
    )),
    prec.left(PREC.or, seq(
      field('left', $.expression),
      field('operator', 'or'),
      field('right', $.expression),
    )),
  ),

  binary_operator: $ => {
    const table = [
      [prec.left, '+', PREC.plus],
      [prec.left, '-', PREC.plus],
      [prec.left, '*', PREC.times],
      [prec.left, '@', PREC.times],
      [prec.left, '/', PREC.times],
      [prec.left, '%', PREC.times],
      [prec.left, '//', PREC.times],
      [prec.right, '**', PREC.power],
      [prec.left, '|', PREC.bitwise_or],
      [prec.left, '&', PREC.bitwise_and],
      [prec.left, '^', PREC.xor],
      [prec.left, '<<', PREC.shift],
      [prec.left, '>>', PREC.shift],
    ];

    // @ts-ignore
    return choice(...table.map(([fn, operator, precedence]) => fn(precedence, seq(
      field('left', $.primary_expression),
      // @ts-ignore
      field('operator', operator),
      field('right', $.primary_expression),
    ))));
  },

  unary_operator: $ => prec(PREC.unary, seq(
    field('operator', choice('+', '-', '~')),
    field('argument', $.primary_expression),
  )),

  comparison_operator: $ => prec.left(PREC.compare, seq(
    $.primary_expression,
    repeat1(seq(
      field('operators',
        choice(
          '<',
          '<=',
          '==',
          '!=',
          '>=',
          '>',
          '<>',
          'in',
          alias(seq('not', 'in'), 'not in'),
          'is',
          alias(seq('is', 'not'), 'is not'),
        )),
      $.primary_expression,
    )),
  )),

  lambda: $ => prec(PREC.lambda, seq(
    'lambda',
    field('parameters', optional($.lambda_parameters)),
    ':',
    field('body', $.expression),
  )),

  lambda_within_for_in_clause: $ => seq(
    'lambda',
    field('parameters', optional($.lambda_parameters)),
    ':',
    field('body', $._expression_within_for_in_clause),
  ),

  assignment: $ => seq(
    field('left', $._left_hand_side),
    choice(
      seq('=', field('right', $._right_hand_side)),
      seq(':', field('type', $.type)),
      seq(':', field('type', $.type), '=', field('right', $._right_hand_side)),
    ),
  ),

  augmented_assignment: $ => seq(
    field('left', $._left_hand_side),
    field('operator', choice(
      '+=', '-=', '*=', '/=', '@=', '//=', '%=', '**=',
      '>>=', '<<=', '&=', '^=', '|=',
    )),
    field('right', $._right_hand_side),
  ),

  _left_hand_side: $ => choice(
    $.pattern,
    $.pattern_list,
  ),

  pattern_list: $ => seq(
    $.pattern,
    choice(
      ',',
      seq(
        repeat1(seq(
          ',',
          $.pattern,
        )),
        optional(','),
      ),
    ),
  ),

  _right_hand_side: $ => choice(
    $.expression,
    $.expression_list,
    $.assignment,
    $.augmented_assignment,
    $.pattern_list,
    $.yield,
  ),

  yield: $ => prec.right(seq(
    'yield',
    choice(
      seq(
        'from',
        $.expression,
      ),
      optional($._expressions),
    ),
  )),

  attribute: $ => prec(PREC.call, seq(
    field('object', $.primary_expression),
    '.',
    field('attribute', $.python_identifier),
  )),

  subscript: $ => prec(PREC.call, seq(
    field('value', $.primary_expression),
    '[',
    commaSep1(field('subscript', choice($.expression, $.slice))),
    optional(','),
    ']',
  )),

  slice: $ => seq(
    optional($.expression),
    ':',
    optional($.expression),
    optional(seq(':', optional($.expression))),
  ),

  ellipsis: _ => '...',

  call: $ => prec(PREC.call, seq(
    field('function', $.primary_expression),
    field('arguments', choice(
      $.generator_expression,
      $.argument_list,
    )),
  )),

  generator_expression: $ => seq(
    '(',
    field('body', $.expression),
    $._comprehension_clauses,
    ')',
  ),

  _comprehension_clauses: $ => seq(
    $.for_in_clause,
    repeat(choice(
      $.for_in_clause,
      $.if_clause,
    )),
  ),

  parenthesized_expression: $ => prec(PREC.parenthesized_expression, seq(
    '(',
    choice($.expression, $.yield),
    ')',
  )),

  _collection_elements: $ => seq(
    commaSep1(choice(
      $.expression, $.yield, $.list_splat, $.parenthesized_list_splat,
    )),
    optional(','),
  ),

  for_in_clause: $ => prec.left(seq(
    optional('async'),
    'for',
    field('left', $._left_hand_side),
    'in',
    field('right', commaSep1($._expression_within_for_in_clause)),
    optional(','),
  )),

  if_clause: $ => seq(
    'if',
    $.expression,
  ),

  _suite: $ => choice(
    alias($._simple_statements, $.block),
    seq($._indent, $.block),
    alias($._newline, $.block),
  ),

  block: $ => seq(
    repeat($._statement),
    $._dedent,
  ),

  expression_list: $ => prec.right(seq(
    $.expression,
    choice(
      ',',
      seq(
        repeat1(seq(
          ',',
          $.expression,
        )),
        optional(','),
      ),
    ),
  )),

  parameters: $ => seq(
    '(',
    optional($._parameters),
    ')',
  ),

  lambda_parameters: $ => $._parameters,

  list_splat: $ => seq(
    '*',
    $.expression,
  ),

  dictionary_splat: $ => seq(
    '**',
    $.expression,
  ),

  _parameters: $ => seq(
    commaSep1($.parameter),
    optional(','),
  ),

  _patterns: $ => seq(
    commaSep1($.pattern),
    optional(','),
  ),

  parameter: $ => choice(
    $.python_identifier,
    $.typed_parameter,
    $.default_parameter,
    $.typed_default_parameter,
    $.list_splat_pattern,
    $.tuple_pattern,
    $.keyword_separator,
    $.positional_separator,
    $.dictionary_splat_pattern,
  ),

  pattern: $ => choice(
    $.python_identifier,
    $.keyword_identifier,
    $.subscript,
    $.attribute,
    $.list_splat_pattern,
    $.tuple_pattern,
    $.list_pattern,
  ),

  tuple_pattern: $ => seq(
    '(',
    optional($._patterns),
    ')',
  ),

  list_pattern: $ => seq(
    '[',
    optional($._patterns),
    ']',
  ),

  default_parameter: $ => seq(
    field('name', choice($.python_identifier, $.tuple_pattern)),
    '=',
    field('value', $.expression),
  ),

  typed_default_parameter: $ => prec(PREC.typed_parameter, seq(
    field('name', $.python_identifier),
    ':',
    field('type', $.type),
    '=',
    field('value', $.expression),
  )),

  list_splat_pattern: $ => seq(
    '*',
    choice($.python_identifier, $.keyword_identifier, $.subscript, $.attribute),
  ),

  dictionary_splat_pattern: $ => seq(
    '**',
    choice($.python_identifier, $.keyword_identifier, $.subscript, $.attribute),
  ),

  as_pattern: $ => prec.left(seq(
    $.expression,
    'as',
    field('alias', alias($.expression, $.as_pattern_target)),
  )),

  _expression_within_for_in_clause: $ => choice(
    $.expression,
    alias($.lambda_within_for_in_clause, $.lambda),
  ),

  expression: $ => choice(
    $.comparison_operator,
    $.not_operator,
    $.boolean_operator,
    $.lambda,
    $.primary_expression,
    $.conditional_expression,
    $.named_expression,
    $.as_pattern,
  ),

  primary_expression: $ => choice(
    $.await,
    $.binary_operator,
    $.python_identifier,
    $.keyword_identifier,
    alias($.identifier, $.python_identifier),
    $.python_string,
    $.concatenated_string,
    $.integer,
    $.float,
    $.true,
    $.false,
    $.none,
    $.unary_operator,
    $.attribute,
    $.subscript,
    $.call,
    $.list,
    $.list_comprehension,
    $.dictionary,
    $.dictionary_comprehension,
    $.set,
    $.set_comprehension,
    $.tuple,
    $.parenthesized_expression,
    $.generator_expression,
    $.ellipsis,
    alias($.list_splat_pattern, $.list_splat),
  ),

  typed_parameter: $ => prec(PREC.typed_parameter, seq(
    choice(
      $.python_identifier,
      $.list_splat_pattern,
      $.dictionary_splat_pattern,
    ),
    ':',
    field('type', $.type),
  )),

  type: $ => choice(
    $.expression,
    $.splat_type,
    $.generic_type,
    $.union_type,
    $.constrained_type,
    $.member_type,
  ),
  splat_type: $ => prec(1, seq(choice('*', '**'), $.python_identifier)),
  generic_type: $ => prec(1, seq($.python_identifier, $.type_parameter)),
  union_type: $ => prec.left(seq($.type, '|', $.type)),
  constrained_type: $ => prec.right(seq($.type, ':', $.type)),
  member_type: $ => seq($.type, '.', $.python_identifier),

  keyword_argument: $ => seq(
    field('name', choice($.python_identifier, $.keyword_identifier)),
    '=',
    field('value', $.expression),
  ),

  list: $ => seq(
    '[',
    optional($._collection_elements),
    ']',
  ),

  set: $ => seq(
    '{',
    $._collection_elements,
    '}',
  ),

  tuple: $ => seq(
    '(',
    optional($._collection_elements),
    ')',
  ),

  dictionary: $ => seq(
    '{',
    optional(commaSep1(choice($.pair, $.dictionary_splat))),
    optional(','),
    '}',
  ),

  pair: $ => seq(
    field('key', $.expression),
    ':',
    field('value', $.expression),
  ),

  list_comprehension: $ => seq(
    '[',
    field('body', $.expression),
    $._comprehension_clauses,
    ']',
  ),

  dictionary_comprehension: $ => seq(
    '{',
    field('body', $.pair),
    $._comprehension_clauses,
    '}',
  ),

  set_comprehension: $ => seq(
    '{',
    field('body', $.expression),
    $._comprehension_clauses,
    '}',
  ),

  conditional_expression: $ => prec.right(PREC.conditional, seq(
    $.expression,
    'if',
    $.expression,
    'else',
    $.expression,
  )),

  concatenated_string: $ => seq(
    $.python_string,
    repeat1($.python_string),
  ),

  python_string: $ => seq(
    $.string_start,
    repeat(choice($.interpolation, $.string_content)),
    $.string_end,
  ),

  string_content: $ => prec.right(repeat1(
    choice(
      $.escape_interpolation,
      $.escape_sequence,
      $._not_escape_sequence,
      $._string_content,
    ))),

  interpolation: $ => seq(
    '{',
    field('expression', $._f_expression),
    optional('='),
    optional(field('type_conversion', $.type_conversion)),
    optional(field('format_specifier', $.format_specifier)),
    '}',
  ),

  _f_expression: $ => choice(
    $.expression,
    $.expression_list,
    $.pattern_list,
    $.yield,
  ),

  escape_sequence: _ => token.immediate(prec(1, seq(
    '\\',
    choice(
      /u[a-fA-F\d]{4}/,
      /U[a-fA-F\d]{8}/,
      /x[a-fA-F\d]{2}/,
      /\d{3}/,
      /\r?\n/,
      /['"abfrntv\\]/,
      /N\{[^}]+\}/,
    ),
  ))),

  _not_escape_sequence: _ => token.immediate('\\'),

  format_specifier: $ => seq(
    ':',
    repeat(choice(
      token(prec(1, /[^{}\n]+/)),
      alias($.interpolation, $.format_expression),
    )),
  ),

  type_conversion: _ => /![a-z]/,

  keyword_identifier: $ => choice(
    prec(-3, alias(
      choice(
        'print',
        'exec',
        'async',
        'await',
        'match',
      ),
      $.python_identifier,
    )),
    alias('type', $.python_identifier),
  ),

  await: $ => prec(PREC.unary, seq(
    'await',
    $.primary_expression,
  )),

  integer: _ => token(choice(
    seq(
      choice('0x', '0X'),
      repeat1(/_?[A-Fa-f0-9]+/),
      optional(/[Ll]/),
    ),
    seq(
      choice('0o', '0O'),
      repeat1(/_?[0-7]+/),
      optional(/[Ll]/),
    ),
    seq(
      choice('0b', '0B'),
      repeat1(/_?[0-1]+/),
      optional(/[Ll]/),
    ),
    seq(
      repeat1(/[0-9]+_?/),
      choice(
        optional(/[Ll]/), // long numbers
        optional(/[jJ]/), // complex numbers
      ),
    ),
  )),

  float: _ => {
    const digits = repeat1(/[0-9]+_?/);
    const exponent = seq(/[eE][\+-]?/, digits);

    return token(seq(
      choice(
        seq(digits, '.', optional(digits), optional(exponent)),
        seq(optional(digits), '.', digits, optional(exponent)),
        seq(digits, exponent),
      ),
      optional(choice(/[Ll]/, /[jJ]/)),
    ));
  },

  true: _ => 'True',
  false: _ => 'False',
  none: _ => 'None',

  python_identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

  line_continuation: _ => token(seq('\\', choice(seq(optional('\r'), '\n'), '\0'))),

  positional_separator: _ => '/',
  keyword_separator: _ => '*',
};

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
  return sep1(rule, ',');
}

/**
 * Creates a rule to match one or more occurrences of `rule` separated by `sep`
 *
 * @param {RuleOrLiteral} rule
 *
 * @param {RuleOrLiteral} separator
 *
 * @return {SeqRule}
 *
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

module.exports.commaSep1 = commaSep1;
module.exports.sep1 = sep1;
