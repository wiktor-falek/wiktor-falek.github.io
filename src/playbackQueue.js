function createPlaybackQueue(arr) {
  function renderPlaybackQueue(queuedVideos) {
    const playbackQueueDiv = document.querySelector("#playback-queue");
    const playbackQueueElementsUl = document.querySelector(
      "#playback-queue #playback-queue-elements"
    );

    const newPlaybackQueueElementsUl = document.createElement("ul");
    newPlaybackQueueElementsUl.id = "playback-queue-elements";

    for (let i = 0; i < queuedVideos.length; i++) {
      const { title } = queuedVideos[i];
      const queueElementText =
        (i + 1).toString().padStart(4, "0") + " - " + title;

      const playbackQueueElementLi = document.createElement("li");
      playbackQueueElementLi.setAttribute("index", i.toString());
      playbackQueueElementLi.innerText = queueElementText;
      playbackQueueElementLi.addEventListener("click", (e) => {
        const index = parseInt(e.target?.getAttribute("index"));
        if (!Number.isNaN(index)) {
          startPlayback(index);
        }
      });

      newPlaybackQueueElementsUl.appendChild(playbackQueueElementLi);
    }

    playbackQueueDiv.replaceChild(
      newPlaybackQueueElementsUl,
      playbackQueueElementsUl
    );
  }

  const array = arr ?? [];
  return new Proxy(array, {
    set: (target, property, value) => {
      target[property] = value;

      renderPlaybackQueue(array);

      return true;
    },
  });
}
