export default function Field({ icon: Icon, rightSlot, ...inputProps }) {
  return (
    <label className="auth-field">
      <Icon width={18} height={18} />
      <input {...inputProps} />
      {rightSlot}
    </label>
  );
}