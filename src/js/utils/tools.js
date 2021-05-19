export default function verifyName(name) {
  const result = { status: false };

  if (!name) {
    result.error = 'Поле должно быть заполнено';
    return result;
  }

  if (/[^A-Za-z0-9]/.test(name)) {
    result.error = 'Поле может содержать только латинские буквы и цифры';
    return result;
  }

  if (/^[^A-Za-z]/.test(name)) {
    result.error = 'Первый символ должен быть буквой';
    return result;
  }

  result.status = true;
  return result;
}
