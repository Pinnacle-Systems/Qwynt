const TransactionActions = ({ leftActions = [], rightActions = [] }) => {
  const renderButton = (action, index) => (
    <div key={action.key || index}>
      <button
        type="button"
        onClick={action.onClick}
        onKeyDown={action.onKeyDown}
        disabled={action.disabled}
        className={action.className}
        title={action.hoverLabel || action.title}
      >
        {action.icon}
        {!action.iconOnly && action.label}
      </button>
    </div>
  );

  return (
    <div className="mt-1 flex flex-wrap items-start gap-2">
      <div className="flex min-w-0 flex-wrap gap-2">
        {leftActions.map(renderButton)}
      </div>
      <div className="flex min-w-0 flex-wrap gap-2 xl:ml-auto">
        {rightActions.map(renderButton)}
      </div>
    </div>
  );
};

export default TransactionActions;
