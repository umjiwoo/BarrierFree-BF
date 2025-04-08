const formatDateManually = (isoString: string): any => {
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 0부터 시작
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return {
    date: `${year}년 ${month}월 ${day}일`,
    time: `${hour}:${minute}:${second}`,
  };
};

export default formatDateManually;
