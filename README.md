# Cat Learns to Jump Buildings Using Q-Learning

https://user-images.githubusercontent.com/46568515/131675555-87817fd4-aa56-41c5-bd86-43358913ab71.mp4

In this project, we used approximate Q-Learning to teach a cat agent the game of jumping across buildings. We created the game environment and animations from scratch. At any given state, the actions available to the cat agent are either JUMP or STAY. Depending on its actions, the cat receives rewards that are stored inside a Q Table. By using the classic Bellman equations, we implemented an exploration vs exploitation strategy to maximize the cat's expected utility at each step. 

To see the cat learning to play the game live, all you have to do is fork the repository on your machine. Click on the ```jumpyCat.html``` file which will open the game on your browser. After about 1 minute and 30 seconds of playing, you'll see that the cat figures out the mechanics of the game and learns to jump just at the right time to avoid falling from the buildings. Also during the learning stage, you'll notice that we made sure to put a pillow on the ground to ensure a safe landing for the cat. So we can safely say that no cats were harmed while making this project!
