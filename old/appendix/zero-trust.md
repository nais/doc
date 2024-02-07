# Zero-Trust Network Architecture

Firewalls and zones have been our primary defense mechanism for years. With this model we have defined a perimeter around our applications; keeping potential attackers on the inside, and to have control of what our applications are able to communicate with on the outside.

![A diagram showing how firewall is used to define a perimeter around a simple structure where the frontend, logic and database applications are protected from the world wide web.](../assets/zero-trust-1.png)

The challenge with this model in a containerized world is that our application portfolio has become more distributed, which leaves us with more components and attack vectors.

![A diagram showing how containerized apps, makes the firewall defend a more complex structure with several applications, components and attack vectors spread and connected to each other.](../assets/zero-trust-2.png)

Additionally, the attack methods have become more sophisticated. Our safety planning and solutions must be able to address the following: _What happens if an attacker is able to breach our perimeter?_

![A diagram showing how several containerized apps are connected, causing the firewall to defend a more complex structure with several applications, components and attack vectors. One of the components contains a wolf, to illustrate that the attacker might already have breached the perimeter and thereby having free access to hunt along the connection lines within the perimeter. ](../assets/zero-trust-3.png)

Since our application's architecture is based primarily on an outer defense layer, it would be a relatively simple task for an attacker that is already on the inside to compromise other applications within the same perimeter. Most applications have implemented further safety mechanisms, but those who rely solely on the safety perimeter are extremely vulnerable.

This problem is addressed using network segmentation; applications with the same safety level and affiliation are grouped together behind separate firewalls.

![A diagram showing how network segmentation can be used to split up containerized applications in two, and that the applications within the same perimeter are still vulnerable for attack. There are still several connected applications within each perimeter, illustrating the vulnerability.](../assets/zero-trust-4.png)

The challenge remains the same, though; a compromised application could mean a compromised zone.

The next level of security using this methodology is micro-segmentation and a zone model where applications and services are grouped in even smaller and more specific zones, givig a potential attacker an even smaller attack surface given a successful attack.

![A diagram showing how network micro-segmentation and a zone model, can split up the applications in several perimeters to reduce the attack surface. There are still several, but fewer, openly connected applications within each perimeter. There are less sheep within each fence, and the wolf would have to jump more fences. The wolf is no longer showing in the illustration, so only alt-text readers will have the joy of imagining wolves jumping fences.](../assets/zero-trust-5.png)

Continuing this methodology, the inevitable conclusion will be a perimeter around each individual application.

![A diagram showing that each application has its own protected perimeter, but the connections between them remain the same as in the previous diagrams. There are now fences around all the applications, but the network connections are open.](../assets/zero-trust-6.png)

Once each application has its own perimeter, the next thing to address is:

* What if the network itself is compromised?
* Are there attackers on the inside that can listen to, or spoof traffic?

This is the case on unsafe networks, like the Internet, but here other safety mechanisms are being used ensuring that sensitive information like bank and health data can be transferred. It is no longer a safe assumption that there are no attackers in our own data centers, our private cloud or in the public cloud, so we have to implement mechanisms to secure the communication between our applications even here.

![A diagram showing that each application has its own protected perimeter, and that the network connections between them are also protected. The transportation security on authentication and authorization between all services are cryptographically certain that both the sender and the receiver are who they claim they are. ](../assets/zero-trust-7.png)

We need to base our transportation security on authentication and authorization between all services, so that we can be cryptographically certain that both the sender and the receiver are who they claim they are. Each endpoint is given a cryptographic identity in form of a certificate proving their identity. This gives us the ability to make policies and control service to service communication based on identity.

