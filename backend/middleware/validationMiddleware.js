export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details.map((detail) => detail.message).join(', ')
      });
    }

    req[property] = value;
    next();
  };
};
