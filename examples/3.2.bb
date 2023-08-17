export ENV_VARIABLE
ENV_VARIABLE = "value from the environment"

export ENV_VARIABLE = "variable-value"

do_foo() {
    bbplain "$ENV_VARIABLE"
}
