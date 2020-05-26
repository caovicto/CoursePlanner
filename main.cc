#include "web/web.h"

emp::web::Document doc("target");

void Ping() { doc << "Ping! "; }

int main() {
  int x = 5;
  doc << "<h1>Hello World!</h1>";
  doc << "x = " << x << ".<br>";

  // Insert an image (in place)
  doc << emp::web::Image("http://www.nyan.cat/cats/original.gif") << "<br>";

  // Create a button and then insert it.
  emp::web::Button my_button( Ping, "Click me!" );
  doc << my_button;
}
