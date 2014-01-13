/*  Draw a Mandelbrot set, maximum magnification 10000000 times;
 *  @author Qian Xie (C) Digest Java, 1999. All rights reserved.
 *  @author qianxie@hotmail.com
 *  @author http://melting.fortunecity.com/trinity/660
 *  @version JDK1.0, AWT Version 
 */
import java.applet.Applet;
import java.awt.*;
import java.awt.image.*;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class Mandelbrot extends Applet{

  private int width, height;
  private double amin = -2.0;
  private double amax =  1.0;
  private double bmin = -1.5;
  private double bmax =  1.5;
  private double alen, blen;
  private double a=0.0;
  private double b=0.0;
  private double x=0.0;
  private double y=0.0;
  private double acenter,bcenter;
  private int zoomin=10;
  private int scaleda,scaledb;
  private BufferedImage bufferedImage;
  Thread t = null;

  Image image=null;
  int[] pixels;
  int alpha = 0xff;
  int red = 0xff;
  int green = 0xbb;
  int blue = 0x55;
  int times = 255;

  public void init() {

    width = size().width;
    height = size().height;
    alen=amax-amin;
    blen=bmax-bmin;

    pixels = new int[width*height];
    bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);

  }
  
  public void paint(Graphics g) {

        double x1,y1;
        for(a=amin;a<amax;a+=((amax-amin)/width)) {
          for(b=bmin;b<bmax;b+=((bmax-bmin)/height)) {
            x=0.0;
            y=0.0;
            int iteration=0;
            while((x*x+y*y<=4.0) && (iteration!=times)) {
              x1 = xmapMandelbrot(x,y,a);
              y1 = ymapMandelbrot(x,y,b);
              x = x1;
              y = y1;
              iteration ++;
            }
            if(iteration<=times && iteration>0) {
              scaleda=scaleX(a,amin,amax);
              scaledb=scaleY(b,bmin,bmax);
              pixels[scaledb*width+scaleda]=
                  alpha<<24 | red<<16 | iteration<<8 | blue;
            }
          }
        }
        
        bufferedImage.setRGB(0, 0, width, height, pixels, 0, width);
        
        g.drawImage(bufferedImage,0,0,width,height,null);
        
        // we save the image
        try {
            File outputfile = new File("saved.png");
            ImageIO.write(bufferedImage, "png", outputfile);
        } catch (IOException e) {
            e.printStackTrace();
        }

  }

  private double xmapMandelbrot(double x, double y, double a) {
    return x*x-y*y+a;
  }

  private double ymapMandelbrot(double x, double y, double b) {
    return 2.0*x*y+b;
  }

  private int scaleX(double x, double xmin, double xmax)  {
    int ivalue;
    if( x >= xmin && x < xmax ) {
      ivalue = (int) ((x - xmin)*width/(xmax - xmin));
    }
    else {
      ivalue=0;
      System.out.println("arg "+x+" out of range:["+xmin+","+xmax+"]");
      System.exit(1);
    }
    return ivalue;
  }

  private int scaleY(double y, double ymin, double ymax)  {
    int jvalue;
    if( y >= ymin && y < ymax ) {
      jvalue = (int) ((y - ymin)*height/(ymax - ymin));
    }
    else {
      jvalue=0;
      System.out.println("arg "+y+" out of range:["+ymin+","+ymax+"]");
      System.exit(2);
    }
    return jvalue;
  }

  public boolean mouseDown (Event e, int x, int y) {
    if(x>width) {x=width;}
    if(x<0) {x=0;}
    if(y>height) {y=height;}
    if(y<0) {y=0;}
    acenter=((double) (x)/(double) (width))*alen+amin;
    bcenter=((double) (y)/(double) (height))*blen+bmin;
    amin=acenter-alen/zoomin;
    amax=acenter+alen/zoomin;
    bmin=bcenter-blen/zoomin;
    bmax=bcenter+blen/zoomin;
    alen=amax-amin;
    blen=bmax-bmin;
    if(Math.max(alen,blen)<0.00000003) {
      amax=1.0;amin=-2.0;bmin=-1.5;bmax=1.5;
      alen=amax-amin;blen=bmax-bmin;
    }
    repaint();
    return true;
  }

}








