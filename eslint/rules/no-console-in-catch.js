module.exports = {
  create(context) {
    return {
      CatchClause(node) {
        const statements = node.body.body
          ?.map((item) => item?.expression?.callee?.object?.name)
          ?.filter((el) => el === "console");
        if (statements?.length > 0) {
          context.report({
            node,
            message:
              "Error in not allow to console, use errorHandler() function to handle error",
          });
        }
      },
    };
  },
};
