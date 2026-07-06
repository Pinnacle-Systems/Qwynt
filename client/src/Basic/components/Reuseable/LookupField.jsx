const LookupField = ({
  component: Component,
  resolver,
  onResolved,
  onError,
  onChange,
  value,
  ...props
}) => {
  const handleChange = async (nextValue) => {
    onChange?.(nextValue);

    if (!resolver || !nextValue) {
      return;
    }

    try {
      const patch = await resolver(nextValue);
      onResolved?.(patch, nextValue);
    } catch (error) {
      onError?.(error);
    }
  };

  return <Component value={value} onChange={handleChange} {...props} />;
};

export default LookupField;
