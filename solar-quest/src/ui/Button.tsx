type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
    >
      {children}
    </button>
  );
}
