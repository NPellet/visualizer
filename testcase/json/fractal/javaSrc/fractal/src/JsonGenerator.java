/*  Draw a Mandelbrot set, maximum magnification 10000000 times;
 *  @author Qian Xie (C) Digest Java, 1999. All rights reserved.
 *  @author qianxie@hotmail.com
 *  @author http://melting.fortunecity.com/trinity/660
 *  @version JDK1.0, AWT Version 
 */
import java.applet.Applet;
import java.awt.*;
import java.awt.image.*;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javax.imageio.ImageIO;

public class JsonGenerator {
	static double AMIN = -2.0;
	static double AMAX =  1.0;
	static double BMIN = -1.5;
	static double BMAX =  1.5;
	static int MIN_ZOOM_FACTOR=0;
	static int MAX_ZOOM_FACTOR=4;
	
	private int width=256;
	private int height=256;
	private double x=0.0;
	private double y=0.0;
	private int zoomStep=2;
	private int scaleda,scaledb;
	private BufferedImage bufferedImage;


	Image image=null;
	int[] pixels;
	int red = 0xff;
	int green = 0xbb;
	int blue = 0x55;
	int times = 255;

	public static void main(String[] args) {
		new JsonGenerator().run();
	}

	public void run() {
		for (int zoomFactor=MIN_ZOOM_FACTOR; zoomFactor<=MAX_ZOOM_FACTOR; zoomFactor++) {
			// for each zoom factor we need to create a kind of table of content
			int numberValues=(int)Math.pow(zoomStep,zoomFactor);
			for (int a=0; a<numberValues; a++) {
				for (int b=0; b<numberValues; b++) {
					create(zoomFactor, a, b);
				}
			}
			createToc(zoomFactor,0);
			createToc(zoomFactor,1);
		}
	}

	private void createToc(int zoomFactor, int type) {
		StringBuffer jsonBuffer=new StringBuffer();
		jsonBuffer.append("{type:'matrix',");
		if (zoomFactor<MAX_ZOOM_FACTOR) {
			if (type==0) {
				jsonBuffer.append("zoomIn:{type:'matrix', url:'../../"+(zoomFactor+1)+"/json/toc.json'},");
			} else if (type==1) {
				jsonBuffer.append("zoomIn:{type:'matrix', url:'../../"+(zoomFactor+1)+"/json/tocImg.json'},");
			}
		}
		if (zoomFactor>MIN_ZOOM_FACTOR) {
			if (type==0) {
				jsonBuffer.append("zoomOut:{type:'matrix', url:'../../"+(zoomFactor-1)+"/json/toc.json'},");
			} else if (type==1) {
				jsonBuffer.append("zoomOut:{type:'matrix', url:'../../"+(zoomFactor-1)+"/json/tocImg.json'},");
			}
			
		}
		
		jsonBuffer.append("value:");
		
		int numberValues=(int)Math.pow(zoomStep,zoomFactor);
		boolean startA=true;
		jsonBuffer.append("[");
		for (int a=0; a<numberValues; a++) {
			if (startA) {
				startA=false;
			} else {
				jsonBuffer.append(",");
			}
			
			jsonBuffer.append("[");
			boolean startB=true;
			for (int b=0; b<numberValues; b++) {
				if (startB) {
					startB=false;
				} else {
					jsonBuffer.append(",");
				}
				if (type==0) {
					jsonBuffer.append("{type:'matrix', url:'"+a+"_"+b+".json'}");
				} else if (type==1) {
					jsonBuffer.append("{type:'image', url:'../png/"+a+"_"+b+".png'}");
				}
			}
			jsonBuffer.append("]");
		}
		jsonBuffer.append("]");
		jsonBuffer.append("}");
		try {
			String jsonFilename=zoomFactor+"";
			if (type==0) {
				jsonFilename+="/json/toc.json";
			} else if (type==1) {
				jsonFilename+="/json/tocImg.json";
			}
			BufferedWriter out = new BufferedWriter(new FileWriter(jsonFilename));
			out.write(jsonBuffer.toString());
			out.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void create(int zoomFactor, int aa, int bb) {
		StringBuffer jsonBuffer=new StringBuffer();
		int numberValues=(int)Math.pow(zoomStep,zoomFactor);
		double aInterval=(AMAX-AMIN)/numberValues;
		double bInterval=(BMAX)/numberValues;
		
		double amin = AMIN+aInterval*aa;
		double amax = AMIN+aInterval*(aa+1);
		double bmin = BMIN+bInterval*bb;
		double bmax = BMIN+bInterval*(bb+1);
		
		pixels = new int[width*height];
		bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

		jsonBuffer.append("{type:'matrix',"+
				"value:");
		
		double x1,y1;
		boolean startA=true;
		jsonBuffer.append("[");
		for(double a=amin;a<amax;a+=((amax-amin)/width)) {
			if (startA) {
				startA=false;
			} else {
				jsonBuffer.append(",");
			}
			jsonBuffer.append("[");
			boolean startB=true;
			for(double b=bmin;b<bmax;b+=((bmax-bmin)/height)) {
				if (startB) {
					startB=false;
				} else {
					jsonBuffer.append(",");
				}
				x=0.0;
				y=0.0;
				int iteration=0;
				while((x*x+y*y<=4.0) && (iteration!=times)) {
					x1 = xmapMandelbrot(x,y,a);
					y1 = ymapMandelbrot(x,y,b);
					x = x1;
					y = y1;
					iteration++;
				}
				scaleda=scaleX(a,amin,amax);
				scaledb=scaleY(b,bmin,bmax);
				int pixelValue=red<<16 | iteration<<8 | blue;
				pixels[scaledb*width+scaleda]=pixelValue;
				jsonBuffer.append(pixelValue+"");
			}
			jsonBuffer.append("]");
		}
		jsonBuffer.append("]");
		jsonBuffer.append("}");
		bufferedImage.setRGB(0, 0, width, height, pixels, 0, width);

		// we create the zoom factor folder
		
		try{
			File f = new File(zoomFactor+"/png");
			f.mkdirs();
			f = new File(zoomFactor+"/json");
			f.mkdirs();
		} catch(Exception e){
			e.printStackTrace();
		}


		try {
			String imageFilename=zoomFactor+"/png/"+aa+"_"+bb+".png";
			File outputfile = new File(imageFilename);
			ImageIO.write(bufferedImage, "png", outputfile);
			String jsonFilename=zoomFactor+"/json/"+aa+"_"+bb+".json";
			BufferedWriter out = new BufferedWriter(new FileWriter(jsonFilename));
			out.write(jsonBuffer.toString());
			out.close();


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


}








